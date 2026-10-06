/**
 * MoujApp Backend - Express Server
 * Endpoints para gerenciar doses, usuários, tratamentos e sync multi-device
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { z } from 'zod';

// Load env vars
dotenv.config();

const app: Express = express();
const PORT = process.env.API_PORT || 3000;

// ===== SUPABASE CLIENT =====
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// ===== MIDDLEWARE =====
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: process.env.VITE_API_URL || 'http://localhost:5173',
  credentials: true,
}));

// ===== LOGGING =====
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });

  next();
});

// ===== TYPES & SCHEMAS =====
interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

// Validação de dose
const DoseSchema = z.object({
  dateISO: z.string().datetime(),
  dosageMg: z.number().min(0).max(10),
  medication: z.string().min(1),
  site: z.string().optional(),
  notes: z.string().optional(),
});

// Validação de registro de usuário
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

// Validação de login
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// ===== AUTH MIDDLEWARE =====
const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const secret = process.env.SUPABASE_JWT_SECRET || 'your-jwt-secret';
    const decoded = jwt.verify(token, secret) as any;

    req.userId = decoded.sub || decoded.userId;
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ===== HEALTH CHECK =====
app.get('/health', (req: Request, res: Response) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    environment: process.env.NODE_ENV || 'development',
    database: 'connected',
    system: {
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heap: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      },
      platform: process.platform,
      node: process.version,
    },
  });
});

// ===== AUTH ENDPOINTS =====

/**
 * POST /auth/register
 * Registrar novo usuário
 */
app.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const data = RegisterSchema.parse(req.body);

    // Hash password
    const hashedPassword = await bcryptjs.hash(data.password, 10);

    // Create user in Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: data.email,
        name: data.name,
        created_at: new Date().toISOString(),
      });

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    // Generate JWT
    const token = jwt.sign(
      { sub: authData.user.id, email: data.email },
      process.env.SUPABASE_JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      id: authData.user.id,
      email: data.email,
      name: data.name,
      token,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /auth/login
 * Login de usuário
 */
app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const data = LoginSchema.parse(req.body);

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    // Generate JWT
    const token = jwt.sign(
      { sub: authData.user.id, email: data.email },
      process.env.SUPABASE_JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '7d' }
    );

    res.json({
      id: authData.user.id,
      email: profile?.email,
      name: profile?.name,
      token,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /auth/refresh
 * Refresh JWT token
 */
app.post('/auth/refresh', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const token = jwt.sign(
      { sub: req.userId, email: req.user?.email },
      process.env.SUPABASE_JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== DOSES ENDPOINTS =====

/**
 * POST /doses
 * Adicionar nova dose
 */
app.post('/doses', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dose = DoseSchema.parse(req.body);

    const { data, error } = await supabase
      .from('doses')
      .insert({
        id: uuidv4(),
        user_id: req.userId,
        ...dose,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /doses
 * Listar doses do usuário (com paginação)
 */
app.get('/doses', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);
    const offset = parseInt(req.query.offset as string) || 0;

    const { data, error, count } = await supabase
      .from('doses')
      .select('*', { count: 'exact' })
      .eq('user_id', req.userId)
      .order('dateISO', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      data,
      count,
      limit,
      offset,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /doses/:id
 * Obter dose específica
 */
app.get('/doses/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('doses')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Dose not found' });
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /doses/:id
 * Atualizar dose
 */
app.put('/doses/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dose = DoseSchema.partial().parse(req.body);

    const { data, error } = await supabase
      .from('doses')
      .update(dose)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /doses/:id
 * Deletar dose
 */
app.delete('/doses/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase
      .from('doses')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== USER PROFILE =====

/**
 * GET /users/me
 * Obter perfil do usuário autenticado
 */
app.get('/users/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /users/me
 * Atualizar perfil do usuário
 */
app.put('/users/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: req.body.name,
        weight: req.body.weight,
        height: req.body.height,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== SYNC ENDPOINTS =====

/**
 * POST /sync/export
 * Exportar todos os dados do usuário
 */
app.post('/sync/export', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const [dosesData, userData] = await Promise.all([
      supabase
        .from('doses')
        .select('*')
        .eq('user_id', req.userId),
      supabase
        .from('users')
        .select('*')
        .eq('id', req.userId)
        .single(),
    ]);

    res.json({
      user: userData.data,
      doses: dosesData.data,
      exported_at: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /sync/import
 * Importar dados (merge com dados existentes)
 */
app.post('/sync/import', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { doses } = req.body;

    if (!Array.isArray(doses)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    // Insert doses (ignorar duplicados)
    const newDoses = doses.map((dose: any) => ({
      ...dose,
      user_id: req.userId,
      id: dose.id || uuidv4(),
    }));

    const { error } = await supabase
      .from('doses')
      .upsert(newDoses, { onConflict: 'id' });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      imported: newDoses.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ERROR HANDLING =====
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`✅ MoujApp Backend listening on port ${PORT}`);
  console.log(`📝 API URL: http://localhost:${PORT}`);
  console.log(`🔐 Supabase: ${process.env.VITE_SUPABASE_URL}`);
});

export default app;
