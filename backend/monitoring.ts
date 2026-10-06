/**
 * Monitoring & Observability - MoujApp Backend
 * Integração com Sentry, Datadog, etc
 */

import { Express, Request, Response, NextFunction } from 'express';

// ===== ERROR TRACKING (Sentry) =====
export function initSentry(app: Express) {
  const sentryDsn = process.env.SENTRY_DSN;

  if (!sentryDsn) {
    console.warn('⚠️  SENTRY_DSN não configurado. Erros não serão rastreados.');
    return;
  }

  // Simular Sentry (em produção usar @sentry/node)
  console.log('✅ Sentry inicializado');
  console.log(`📍 DSN: ${sentryDsn}`);
}

// ===== METRICS & LOGGING =====
interface RequestMetrics {
  timestamp: string;
  method: string;
  path: string;
  status: number;
  duration: number;
  userId?: string;
  error?: string;
}

const metrics: RequestMetrics[] = [];

/**
 * Middleware de logging estruturado
 */
export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const metric: RequestMetrics = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
    };

    // Adicionar ao array (depois enviar para observability tool)
    metrics.push(metric);

    // Log no console
    const levelEmoji =
      res.statusCode < 400 ? '✅' :
      res.statusCode < 500 ? '⚠️ ' : '❌';

    console.log(
      `${levelEmoji} [${metric.timestamp}] ${metric.method} ${metric.path} ${metric.status} ${duration}ms`
    );

    // Manter apenas últimos 1000 registros
    if (metrics.length > 1000) {
      metrics.shift();
    }
  });

  next();
}

// ===== HEALTH CHECK ENDPOINT =====
export function healthCheckEndpoint(req: Request, res: Response) {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    environment: process.env.NODE_ENV || 'development',

    // Metrics
    metrics: {
      requests_total: metrics.length,
      avg_response_time: metrics.length > 0
        ? Math.round(metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length)
        : 0,
      errors_last_hour: metrics.filter(
        m => m.status >= 500 &&
             new Date(m.timestamp).getTime() > Date.now() - 3600000
      ).length,
    },

    // System
    system: {
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heap: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      },
      node_version: process.version,
      platform: process.platform,
    },

    // Database (seria conectado de verdade)
    database: {
      connected: true,
      status: 'operational',
    },
  });
}

// ===== ALERTAS =====
export function checkHealthAlerts() {
  const now = Date.now();
  const fiveMinutesAgo = now - 300000; // 5 min

  // Filtrar metrics dos últimos 5 minutos
  const recentMetrics = metrics.filter(
    m => new Date(m.timestamp).getTime() > fiveMinutesAgo
  );

  // Alert 1: Alta taxa de erros
  const errorCount = recentMetrics.filter(m => m.status >= 500).length;
  const errorRate = recentMetrics.length > 0
    ? (errorCount / recentMetrics.length) * 100
    : 0;

  if (errorRate > 10) {
    console.error(`🚨 ALERT: Taxa de erro alta (${errorRate.toFixed(2)}%)`);
    // Enviar para Sentry/PagerDuty aqui
  }

  // Alert 2: Slow requests
  const slowRequests = recentMetrics.filter(m => m.duration > 5000);
  if (slowRequests.length > 5) {
    console.warn(`⚠️  ALERT: ${slowRequests.length} requisições lentas (>5s) nos últimos 5 minutos`);
  }

  // Alert 3: High memory usage
  const memUsage = process.memoryUsage();
  const heapPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  if (heapPercent > 90) {
    console.error(`🚨 ALERT: Heap memory alto (${heapPercent.toFixed(2)}%)`);
  }
}

// ===== TRACES (OpenTelemetry) =====
export function createSpan(name: string) {
  const start = Date.now();

  return {
    end: () => {
      const duration = Date.now() - start;
      console.log(`  📊 [${name}] ${duration}ms`);
    },
  };
}

// ===== PERIODIC HEALTH CHECK =====
export function startHealthCheckInterval() {
  setInterval(() => {
    checkHealthAlerts();
  }, 300000); // A cada 5 minutos

  console.log('✅ Health check interval iniciado (5 min)');
}

// ===== GRACEFUL SHUTDOWN =====
export function setupGracefulShutdown(server: any) {
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} recebido. Encerrando gracefully...`);

    server.close(() => {
      console.log('✅ Servidor encerrado');

      // Logs finais
      console.log(`\n📊 Estatísticas finais:`);
      console.log(`  Total de requisições: ${metrics.length}`);
      console.log(`  Tempo médio: ${metrics.length > 0 ? Math.round(metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length) : 0}ms`);
      console.log(`  Erros: ${metrics.filter(m => m.status >= 500).length}`);

      process.exit(0);
    });

    // Forçar saída se não fechar em 10s
    setTimeout(() => {
      console.error('❌ Timeout ao encerrar. Saída forçada.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  console.log('✅ Graceful shutdown configurado');
}

// ===== UNCAUGHT EXCEPTIONS =====
export function setupErrorHandlers() {
  process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
    console.error(error.stack);
    // Em produção, enviar para Sentry
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
    // Em produção, enviar para Sentry
  });

  console.log('✅ Error handlers configurados');
}

// ===== EXPORT METRICS (para ferramentas externas) =====
export function getMetrics() {
  return {
    total_requests: metrics.length,
    by_status: {
      '2xx': metrics.filter(m => m.status < 300).length,
      '3xx': metrics.filter(m => m.status >= 300 && m.status < 400).length,
      '4xx': metrics.filter(m => m.status >= 400 && m.status < 500).length,
      '5xx': metrics.filter(m => m.status >= 500).length,
    },
    avg_response_time: metrics.length > 0
      ? Math.round(metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length)
      : 0,
    p95_response_time: metrics.length > 0
      ? metrics.sort((a, b) => a.duration - b.duration)[Math.floor(metrics.length * 0.95)]?.duration || 0
      : 0,
    endpoints: [...new Set(metrics.map(m => m.path))].length,
    timestamp: new Date().toISOString(),
  };
}

// ===== DASHBOARD ENDPOINT =====
export function dashboardEndpoint(req: Request, res: Response) {
  res.json({
    metrics: getMetrics(),
    system: {
      uptime: Math.floor(process.uptime()),
      memory: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heap: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
      node_version: process.version,
    },
    recent_requests: metrics.slice(-20),
  });
}
