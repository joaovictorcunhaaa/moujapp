import { useState, useEffect } from 'react';
import { loadFromStorage, saveToStorage, removeFromStorage } from '@/utils/storage';
import { StorageSchemas } from '@/utils/storage';

export interface LifestyleData {
  activityLevel?: 'sedentary' | 'lightly-active' | 'moderately-active' | 'active' | 'very-active';
  weight?: number; // kg atual
  waterGoal?: number; // litros
  calorieGoal?: number; // kcal
  weightLossSpeed?: number; // kg/week
  weightLossHistory?: Array<{
    date: string; // ISO datetime
    weight: number;
  }>;
}

const STORAGE_KEY = 'moujapp-lifestyle';

const defaultLifestyleData: LifestyleData = {
  waterGoal: 2.5,
  weightLossHistory: [],
};

export const useLifestyle = () => {
  // ✅ Carregar com validação - nunca quebra
  const [data, setData] = useState<LifestyleData>(() => {
    return loadFromStorage(STORAGE_KEY, StorageSchemas.lifestyle, defaultLifestyleData);
  });

  const [error, setError] = useState<string | null>(null);

  // ✅ Salvar com validação - sempre seguro
  useEffect(() => {
    const success = saveToStorage(STORAGE_KEY, data, StorageSchemas.lifestyle);
    if (!success) {
      setError('Falha ao salvar dados de estilo de vida');
    } else {
      setError(null);
    }
  }, [data]);

  const updateData = (updates: Partial<LifestyleData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const addWeightEntry = (weight: number) => {
    const entry = {
      date: new Date().toISOString(),
      weight,
    };

    setData(prev => ({
      ...prev,
      weight,
      weightLossHistory: [...(prev.weightLossHistory || []), entry],
    }));
  };

  const resetLifestyle = () => {
    setData(defaultLifestyleData);
    removeFromStorage(STORAGE_KEY);
  };

  return {
    data,
    updateData,
    addWeightEntry,
    resetLifestyle,
    error,
  };
};
