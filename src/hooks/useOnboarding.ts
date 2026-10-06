import { useState, useEffect } from 'react';
import { OnboardingData, defaultOnboardingData } from '@/types/onboarding';
import { loadFromStorage, saveToStorage, removeFromStorage } from '@/utils/storage';
import { StorageSchemas } from '@/utils/storage';

const STORAGE_KEY = 'moujapp-onboarding';

export const useOnboarding = () => {
  // ✅ Carregar com validação - nunca quebra
  const [data, setData] = useState<OnboardingData>(() => {
    return loadFromStorage(STORAGE_KEY, StorageSchemas.onboarding, defaultOnboardingData);
  });

  // ✅ Salvar com validação - sempre seguro
  useEffect(() => {
    saveToStorage(STORAGE_KEY, data, StorageSchemas.onboarding);
  }, [data]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    setData(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
  };

  const previousStep = () => {
    setData(prev => ({ ...prev, currentStep: Math.max(0, prev.currentStep - 1) }));
  };

  const resetOnboarding = () => {
    setData(defaultOnboardingData);
    removeFromStorage(STORAGE_KEY);
  };

  return {
    data,
    updateData,
    nextStep,
    previousStep,
    resetOnboarding,
  };
};
