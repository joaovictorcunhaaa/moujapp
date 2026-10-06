/**
 * Sistema centralizado de storage com validação Zod
 * Garante que NADA quebra mesmo se os dados estiverem corrompidos
 */

import { z, ZodSchema } from 'zod';

/**
 * Logs de erro de storage (para debug)
 */
const storageErrors: Array<{ key: string; error: string; timestamp: Date }> = [];

export const getStorageErrors = () => storageErrors;

/**
 * Carregar dados do localStorage com validação
 * @param key - Chave do localStorage
 * @param schema - Schema Zod para validação
 * @param fallback - Valor padrão se falhar
 * @returns Dados validados ou fallback
 */
export const loadFromStorage = <T,>(
  key: string,
  schema: ZodSchema,
  fallback: T
): T => {
  try {
    // 1. Tentar ler do localStorage
    const raw = localStorage.getItem(key);

    if (!raw) {
      // Se não existe, retorna fallback
      return fallback;
    }

    // 2. Tentar fazer parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (syntaxError) {
      // JSON corrompido - limpar e retornar fallback
      console.error(`Storage: JSON inválido para "${key}". Limpando...`, syntaxError);
      localStorage.removeItem(key);
      storageErrors.push({
        key,
        error: `JSON inválido: ${syntaxError instanceof Error ? syntaxError.message : 'Unknown'}`,
        timestamp: new Date(),
      });
      return fallback;
    }

    // 3. Validar com Zod
    const validation = schema.safeParse(parsed);

    if (!validation.success) {
      // Validação falhou - tentar recuperar campos válidos
      console.error(`Storage: Validação falhou para "${key}"`, validation.error.errors);
      storageErrors.push({
        key,
        error: `Validação falhou: ${JSON.stringify(validation.error.errors)}`,
        timestamp: new Date(),
      });

      // Se é um objeto, tentar pegar campos válidos
      if (typeof parsed === 'object' && parsed !== null && typeof fallback === 'object') {
        const partial = { ...fallback };
        for (const field in parsed) {
          if (field in partial) {
            (partial as any)[field] = (parsed as any)[field];
          }
        }
        return partial;
      }

      return fallback;
    }

    // 4. Sucesso! Retornar dados validados
    return validation.data as T;
  } catch (error) {
    // Erro inesperado - retornar fallback e logar
    console.error(`Storage: Erro inesperado ao carregar "${key}"`, error);
    storageErrors.push({
      key,
      error: `Erro inesperado: ${error instanceof Error ? error.message : 'Unknown'}`,
      timestamp: new Date(),
    });
    return fallback;
  }
};

/**
 * Salvar dados no localStorage com validação
 * @param key - Chave do localStorage
 * @param data - Dados a salvar
 * @param schema - Schema Zod para validação
 * @returns true se salvou com sucesso, false caso contrário
 */
export const saveToStorage = <T,>(key: string, data: T, schema: ZodSchema): boolean => {
  try {
    // 1. Validar dados antes de salvar
    const validation = schema.safeParse(data);

    if (!validation.success) {
      console.error(`Storage: Não pode salvar "${key}" - validação falhou`, validation.error.errors);
      storageErrors.push({
        key,
        error: `Validação falhou ao salvar: ${JSON.stringify(validation.error.errors)}`,
        timestamp: new Date(),
      });
      return false;
    }

    // 2. Tentar salvar no localStorage
    try {
      localStorage.setItem(key, JSON.stringify(validation.data));
      return true;
    } catch (quotaError) {
      // Storage cheio (quota excedida)
      console.error(`Storage: Quota excedida para "${key}"`, quotaError);
      storageErrors.push({
        key,
        error: `Quota excedida: ${quotaError instanceof Error ? quotaError.message : 'Unknown'}`,
        timestamp: new Date(),
      });
      return false;
    }
  } catch (error) {
    console.error(`Storage: Erro inesperado ao salvar "${key}"`, error);
    storageErrors.push({
      key,
      error: `Erro inesperado: ${error instanceof Error ? error.message : 'Unknown'}`,
      timestamp: new Date(),
    });
    return false;
  }
};

/**
 * Remover dados do localStorage
 */
export const removeFromStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Storage: Erro ao remover "${key}"`, error);
    return false;
  }
};

/**
 * Limpar TODOS os dados (reset completo)
 */
export const clearAllStorage = (keys: string[]): boolean => {
  try {
    keys.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Storage: Erro ao limpar tudo', error);
    return false;
  }
};

/**
 * Schemas Zod reutilizáveis
 */
export const StorageSchemas = {
  // Onboarding
  birthDate: z
    .object({
      day: z.number().min(1).max(31),
      month: z.number().min(1).max(12),
      year: z.number().min(1900).max(new Date().getFullYear()),
    })
    .optional(),

  onboarding: z.object({
    // Personal Info
    name: z.string().optional(),
    email: z.string().email().optional(),
    referralCode: z.string().optional(),
    birthDate: z
      .object({
        day: z.number().min(1).max(31),
        month: z.number().min(1).max(12),
        year: z.number().min(1900),
      })
      .optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),

    // Measurements
    height: z.number().min(100).max(250).optional(),
    weight: z.number().min(30).max(500).optional(),
    currentWeight: z.number().min(30).max(500).optional(),
    startWeight: z.number().min(30).max(500).optional(),
    targetWeight: z.number().min(30).max(500).optional(),
    weightToLose: z.number().min(0).optional(),

    // Medication
    medication: z.string().optional(),
    currentDose: z.string().optional(),
    frequency: z.string().optional(),
    treatmentStatus: z.enum(['already-using', 'want-to-start']).optional(),

    // Lifestyle
    activityLevel: z.enum(['sedentary', 'lightly-active', 'moderately-active', 'active', 'very-active']).optional(),
    weightLossSpeed: z.number().min(0.1).max(3).optional(),

    // Motivation & Side Effects
    motivations: z.array(z.string()).optional(),
    sideEffects: z.string().optional(),

    // Progress
    currentStep: z.number().min(0),
    completedOnboarding: z.boolean(),
  }),

  // Doses
  dose: z.object({
    id: z.string().min(1),
    dateISO: z.string().datetime(),
    dosageMg: z.number().positive(),
    site: z.string().optional(),
  }),

  doses: z.array(
    z.object({
      id: z.string().min(1),
      dateISO: z.string().datetime(),
      dosageMg: z.number().positive(),
      site: z.string().optional(),
    })
  ),

  // Lifestyle
  lifestyle: z.object({
    activityLevel: z.enum(['sedentary', 'lightly-active', 'moderately-active', 'active', 'very-active']).optional(),
    weight: z.number().min(30).max(500).optional(),
    waterGoal: z.number().positive().optional(),
    calorieGoal: z.number().positive().optional(),
    weightLossSpeed: z.number().min(0.1).max(3).optional(),
    weightLossHistory: z
      .array(
        z.object({
          date: z.string().datetime(),
          weight: z.number(),
        })
      )
      .optional(),
  }),
};

/**
 * Hook para monitorar erros de storage
 * Use para debug
 */
export const useStorageDebug = () => {
  return {
    errors: storageErrors,
    clearErrors: () => storageErrors.splice(0),
    lastError: storageErrors[storageErrors.length - 1],
  };
};
