export interface OnboardingData {
  // Personal Info
  name?: string;
  email?: string;
  referralCode?: string;
  birthDate?: {
    day: number;
    month: number;
    year: number;
  };
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  
  // Measurements
  height?: number; // cm
  weight?: number; // kg
  currentWeight?: number; // kg
  startWeight?: number; // kg
  targetWeight?: number; // kg
  weightToLose?: number; // kg
  
  // Medication
  medication?: string;
  currentDose?: string;
  frequency?: string;
  treatmentStatus?: 'already-using' | 'want-to-start';
  
  // Lifestyle
  activityLevel?: 'sedentary' | 'lightly-active' | 'moderately-active' | 'active' | 'very-active';
  weightLossSpeed?: number; // kg/week
  
  // Motivation & Side Effects
  motivations?: string[];
  sideEffects?: string;
  
  // Progress
  currentStep: number;
  completedOnboarding: boolean;
}

export const defaultOnboardingData: OnboardingData = {
  currentStep: 0,
  completedOnboarding: false,
};
