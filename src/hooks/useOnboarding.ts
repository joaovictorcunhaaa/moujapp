import { useState, useEffect } from 'react';
import { OnboardingData, defaultOnboardingData } from '@/types/onboarding';

const STORAGE_KEY = 'moujapp-onboarding';

export const useOnboarding = () => {
  const [data, setData] = useState<OnboardingData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultOnboardingData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    data,
    updateData,
    nextStep,
    previousStep,
    resetOnboarding,
  };
};
