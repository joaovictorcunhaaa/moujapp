/**
 * Segurança para Vercel Functions
 * - Rate limiting por IP
 * - Logging de erros
 * - Validação de requests
 */

import { z } from 'zod';

// Rate limiting em memória (simples)
// Em produção, usar Upstash Redis
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const getClientIP = (request: Request): string => {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
};

/**
 * Rate limit simples por IP
 * @param ip - IP do cliente
 * @param maxRequests - Máximo de requests
 * @param windowMs - Janela de tempo em ms
 */
export const checkRateLimit = (
  ip: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minuto
): { allowed: boolean; remaining: number; retryAfter: number } => {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    // Nova janela
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfter: 0 };
  }

  record.count++;

  if (record.count > maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    retryAfter: 0,
  };
};

/**
 * Logger estruturado para Vercel
 */
export class Logger {
  private context: Record<string, any> = {};

  constructor(context?: Record<string, any>) {
    this.context = context || {};
  }

  private formatLog(level: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const log = {
      timestamp,
      level,
      message,
      ...this.context,
      ...(data && { data }),
    };
    return JSON.stringify(log);
  }

  info(message: string, data?: any) {
    console.log(this.formatLog('INFO', message, data));
  }

  warn(message: string, data?: any) {
    console.warn(this.formatLog('WARN', message, data));
  }

  error(message: string, error?: unknown, data?: any) {
    const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : error;
    console.error(this.formatLog('ERROR', message, { error: errorData, ...data }));
  }
}

/**
 * Resposta JSON estruturada
 */
export const jsonResponse = (
  data: any,
  status: number = 200,
  headers: Record<string, string> = {}
): Response => {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      ...headers,
    },
  });
};

/**
 * Erro estruturado
 */
export const errorResponse = (
  message: string,
  status: number = 400,
  code?: string,
  details?: any
): Response => {
  return jsonResponse(
    {
      error: {
        message,
        code: code || `ERROR_${status}`,
        ...(details && { details }),
      },
    },
    status
  );
};

/**
 * Validadores comuns
 */
export const validators = {
  image: z.string().regex(/^data:image\//, 'Imagem deve estar em base64').max(4_000_000, 'Imagem muito grande (max 4MB)'),

  chatMessage: z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(4000),
  }),

  chatMessages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(4000),
    })
  ).min(1).max(20),

  chatContext: z.object({
    medication: z.string().optional(),
    currentDose: z.string().optional(),
    frequency: z.string().optional(),
  }).optional(),
};

/**
 * Wrapper para endpoints seguras
 */
export const secureEndpoint = async (
  handler: (request: Request, logger: Logger) => Promise<Response>
) => {
  return async (request: Request): Promise<Response> => {
    const ip = getClientIP(request);
    const logger = new Logger({ ip, method: request.method, url: request.url });

    try {
      // Validar método
      if (request.method !== 'POST') {
        return errorResponse('Método não permitido', 405, 'METHOD_NOT_ALLOWED');
      }

      // Rate limiting
      const rateLimit = checkRateLimit(ip, 10, 60000); // 10 requests por minuto
      if (!rateLimit.allowed) {
        logger.warn('Rate limit exceeded', { ip, retryAfter: rateLimit.retryAfter });
        return jsonResponse(
          {
            error: {
              message: 'Muitas requisições. Tente novamente em alguns segundos.',
              code: 'RATE_LIMIT_EXCEEDED',
              retryAfter: rateLimit.retryAfter,
            },
          },
          429,
          {
            'Retry-After': String(rateLimit.retryAfter),
          }
        );
      }

      // Executar handler
      const response = await handler(request, logger);
      logger.info('Request successful', { status: response.status });
      return response;
    } catch (error) {
      logger.error('Unhandled error', error);
      return errorResponse('Erro interno do servidor', 500, 'INTERNAL_SERVER_ERROR');
    }
  };
};
