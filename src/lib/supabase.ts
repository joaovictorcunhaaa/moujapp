/**
 * Supabase Client - Configuração e inicialização
 */

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis Supabase não configuradas');
  console.error('Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY ao .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// ===== TYPES =====
export interface User {
  id: string;
  email: string;
  name: string;
  weight?: number;
  height?: number;
  onboarding_completed: boolean;
  medication_type?: string;
  theme: 'light' | 'dark';
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Dose {
  id: string;
  user_id: string;
  dateISO: string;
  dosageMg: number;
  medication: string;
  site?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Lifestyle {
  id: string;
  user_id: string;
  activity_level?: string;
  calories_goal?: number;
  water_goal_ml?: number;
  current_weight?: number;
  weight_loss_speed?: string;
  created_at: string;
  updated_at: string;
}

export interface WeightHistory {
  id: string;
  user_id: string;
  date_iso: string;
  weight_kg: number;
  notes?: string;
  created_at: string;
}

// ===== SCHEMAS FOR VALIDATION =====
export const DoseSchema = z.object({
  dateISO: z.string().datetime(),
  dosageMg: z.number().min(0).max(10),
  medication: z.string().min(1),
  site: z.string().optional(),
  notes: z.string().optional(),
});

export const UserUpdateSchema = z.object({
  name: z.string().optional(),
  weight: z.number().optional(),
  height: z.number().optional(),
});

export const LifestyleSchema = z.object({
  activity_level: z.string().optional(),
  calories_goal: z.number().optional(),
  water_goal_ml: z.number().optional(),
  current_weight: z.number().optional(),
  weight_loss_speed: z.string().optional(),
});

// ===== AUTH FUNCTIONS =====

/**
 * Registrar novo usuário
 */
export async function register(email: string, password: string, name: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;

    return { user: data.user, session: data.session };
  } catch (error: any) {
    throw new Error(`Registration failed: ${error.message}`);
  }
}

/**
 * Login
 */
export async function login(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { user: data.user, session: data.session };
  } catch (error: any) {
    throw new Error(`Login failed: ${error.message}`);
  }
}

/**
 * Logout
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Obter usuário autenticado
 */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Watch de mudanças de autenticação
 */
export function onAuthStateChange(callback: (user: any) => void) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });

  return data.subscription.unsubscribe;
}

// ===== USER FUNCTIONS =====

/**
 * Obter perfil do usuário
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

/**
 * Atualizar perfil do usuário
 */
export async function updateUserProfile(userId: string, updates: Partial<User>) {
  try {
    UserUpdateSchema.parse(updates);

    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error: any) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}

// ===== DOSE FUNCTIONS =====

/**
 * Adicionar dose
 */
export async function addDose(userId: string, dose: z.infer<typeof DoseSchema>) {
  try {
    DoseSchema.parse(dose);

    const { data, error } = await supabase
      .from('doses')
      .insert({
        user_id: userId,
        ...dose,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error: any) {
    throw new Error(`Failed to add dose: ${error.message}`);
  }
}

/**
 * Obter doses do usuário
 */
export async function getDoses(
  userId: string,
  options: { limit?: number; offset?: number } = {}
) {
  const limit = Math.min(options.limit || 50, 500);
  const offset = options.offset || 0;

  const { data, error, count } = await supabase
    .from('doses')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('dateISO', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching doses:', error);
    return { data: [], count: 0 };
  }

  return { data, count };
}

/**
 * Atualizar dose
 */
export async function updateDose(doseId: string, updates: Partial<Dose>) {
  try {
    const { data, error } = await supabase
      .from('doses')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', doseId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error: any) {
    throw new Error(`Failed to update dose: ${error.message}`);
  }
}

/**
 * Deletar dose
 */
export async function deleteDose(doseId: string) {
  try {
    const { error } = await supabase
      .from('doses')
      .delete()
      .eq('id', doseId);

    if (error) throw error;
  } catch (error: any) {
    throw new Error(`Failed to delete dose: ${error.message}`);
  }
}

// ===== LIFESTYLE FUNCTIONS =====

/**
 * Obter dados de lifestyle
 */
export async function getLifestyle(userId: string): Promise<Lifestyle | null> {
  const { data, error } = await supabase
    .from('lifestyle')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // Criar registro vazio se não existir
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching lifestyle:', error);
    return null;
  }

  return data;
}

/**
 * Atualizar lifestyle
 */
export async function updateLifestyle(userId: string, lifestyle: Partial<Lifestyle>) {
  try {
    LifestyleSchema.parse(lifestyle);

    const existing = await getLifestyle(userId);

    if (existing) {
      const { data, error } = await supabase
        .from('lifestyle')
        .update({
          ...lifestyle,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('lifestyle')
        .insert({
          user_id: userId,
          ...lifestyle,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error: any) {
    throw new Error(`Failed to update lifestyle: ${error.message}`);
  }
}

// ===== WEIGHT HISTORY FUNCTIONS =====

/**
 * Adicionar peso
 */
export async function addWeight(userId: string, weight_kg: number, notes?: string) {
  try {
    const { data, error } = await supabase
      .from('weight_history')
      .insert({
        user_id: userId,
        date_iso: new Date().toISOString(),
        weight_kg,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error: any) {
    throw new Error(`Failed to add weight: ${error.message}`);
  }
}

/**
 * Obter histórico de peso
 */
export async function getWeightHistory(userId: string) {
  const { data, error } = await supabase
    .from('weight_history')
    .select('*')
    .eq('user_id', userId)
    .order('date_iso', { ascending: false });

  if (error) {
    console.error('Error fetching weight history:', error);
    return [];
  }

  return data;
}

// ===== SYNC FUNCTIONS =====

/**
 * Exportar dados para sincronização
 */
export async function exportData(userId: string) {
  try {
    const [user, doses, lifestyle, weights] = await Promise.all([
      getUserProfile(userId),
      supabase.from('doses').select('*').eq('user_id', userId),
      getLifestyle(userId),
      getWeightHistory(userId),
    ]);

    return {
      user,
      doses: doses.data || [],
      lifestyle,
      weights,
      exported_at: new Date().toISOString(),
    };
  } catch (error: any) {
    throw new Error(`Failed to export data: ${error.message}`);
  }
}

/**
 * Importar dados (merge)
 */
export async function importData(userId: string, data: any) {
  try {
    if (data.doses && Array.isArray(data.doses)) {
      for (const dose of data.doses) {
        await supabase.from('doses').upsert({
          ...dose,
          user_id: userId,
          id: dose.id || undefined,
        });
      }
    }

    if (data.weights && Array.isArray(data.weights)) {
      for (const weight of data.weights) {
        await supabase.from('weight_history').upsert({
          ...weight,
          user_id: userId,
          id: weight.id || undefined,
        });
      }
    }

    return { imported: true };
  } catch (error: any) {
    throw new Error(`Failed to import data: ${error.message}`);
  }
}
