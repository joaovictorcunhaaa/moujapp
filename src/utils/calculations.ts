export interface NutritionalGoals {
  calories: number;
  protein: number; // gramas
  fiber: number; // gramas
  water: number; // litros
  carbs: number; // gramas
  fat: number; // gramas
}

export const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Abaixo do peso';
  if (bmi < 25) return 'Peso normal';
  if (bmi < 30) return 'Sobrepeso';
  if (bmi < 35) return 'Obesidade Grau I';
  if (bmi < 40) return 'Obesidade Grau II';
  return 'Obesidade Grau III';
};

export const getFiberByBMI = (bmi: number): number => {
  if (bmi < 18.5) return 20;
  if (bmi < 25) return 25;
  if (bmi < 30) return 30;
  return 35; // Obesidade I, II, III
};

export const calculateTMB = (
  weight: number,
  height: number,
  age: number,
  gender: string
): number => {
  // Fórmula de Mifflin-St Jeor (mais precisa na literatura atual)
  // height em cm, weight em kg
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

export const calculateTDEE = (tmb: number, activityLevel: string): number => {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    'lightly-active': 1.35,
    'moderately-active': 1.55,
    // "active" = treino forte 5–6x/semana
    active: 1.75,
    'very-active': 1.9,
  };
  return tmb * (multipliers[activityLevel] || 1.2);
};

export const calculateNutritionalGoals = (
  weight: number,
  height: number,
  age: number,
  gender: string,
  activityLevel: string,
  weightLossSpeed: number
): NutritionalGoals => {
  const tmb = calculateTMB(weight, height, age, gender);
  const tdee = calculateTDEE(tmb, activityLevel);
  const bmi = calculateBMI(weight, height);
  
  // Déficit calórico: 1kg de gordura ≈ 7700 calorias
  const weeklyDeficit = weightLossSpeed * 7700;
  const dailyDeficit = weeklyDeficit / 7;
  const targetCalories = Math.round(tdee - dailyDeficit);
  
  // Proteína: 1.6-2.2g por kg de peso (ideal para manutenção muscular)
  const protein = Math.round(weight * 2);
  
  // Calorias da proteína (1g = 4kcal)
  const proteinCalories = protein * 4;
  
  // Calorias restantes para carboidratos e gorduras
  const remainingCalories = targetCalories - proteinCalories;
  
  // Distribuição (ex: 50% carb, 50% fat)
  const carbCalories = remainingCalories * 0.5;
  const fatCalories = remainingCalories * 0.5;
  
  // Conversão para gramas (1g carb = 4kcal, 1g fat = 9kcal)
  const carbs = Math.round(carbCalories / 4);
  const fat = Math.round(fatCalories / 9);

  // Fibra: ajusta conforme IMC
  const fiber = getFiberByBMI(bmi);
  
  // Água: 35ml por kg de peso
  const water = Number(((weight * 35) / 1000).toFixed(1));
  
  return {
    calories: targetCalories,
    protein,
    fiber,
    water,
    carbs,
    fat,
  };
};

// Base calórica simples por faixa de IMC (solução direta conforme solicitação)
export const getDailyCalorieBaseByBMI = (bmi: number): number => {
  if (bmi < 18.5) return 2200; // abaixo do peso: manter/superávit leve
  if (bmi < 25) return 2000;   // peso normal
  if (bmi < 30) return 1800;   // sobrepeso
  if (bmi < 35) return 1600;   // obesidade I
  if (bmi < 40) return 1500;   // obesidade II
  return 1400;                 // obesidade III
};

// Faixa de IMC considerada saudável e sugestão de peso alvo
export const getHealthyBMIRange = () => ({ min: 18.5, max: 24.9 });

export const getSuggestedHealthyWeight = (height: number, preference: 'mid' | 'min' | 'max' = 'mid'): number => {
  const heightMeters = height / 100;
  const { min, max } = getHealthyBMIRange();
  const targetBMI = preference === 'min' ? min : preference === 'max' ? max : (min + max) / 2; // ~21.7
  return Number((targetBMI * heightMeters * heightMeters).toFixed(1));
};

// Metas nutricionais derivadas de uma base calórica por IMC
export const calculateNutritionalGoalsFromBMI = (
  weight: number,
  height: number,
  age: number,
  gender: string,
  activityLevel: string
): NutritionalGoals => {
  const bmi = calculateBMI(weight, height);
  const targetCalories = getDailyCalorieBaseByBMI(bmi);

  const protein = Math.round(weight * 2);
  const proteinCalories = protein * 4;
  const remainingCalories = Math.max(targetCalories - proteinCalories, 0);
  const carbCalories = remainingCalories * 0.5;
  const fatCalories = remainingCalories * 0.5;
  const carbs = Math.round(carbCalories / 4);
  const fat = Math.round(fatCalories / 9);

  const fiber = getFiberByBMI(bmi);
  const water = Number(((weight * 35) / 1000).toFixed(1));

  return {
    calories: targetCalories,
    protein,
    fiber,
    water,
    carbs,
    fat,
  };
};

// Metas nutricionais derivadas de TDEE com déficit percentual
export const calculateNutritionalGoalsFromTDEE = (
  weight: number,
  height: number,
  age: number,
  gender: string,
  activityLevel: string,
  deficitPercent: number // 0.10 a 0.20 recomendado
): NutritionalGoals => {
  const tmb = calculateTMB(weight, height, age, gender);
  const tdee = calculateTDEE(tmb, activityLevel);
  const bmi = calculateBMI(weight, height);

  const appliedDeficit = Math.min(Math.max(deficitPercent, 0), 0.4); // segurança: até 40%
  const targetCalories = Math.round(tdee * (1 - appliedDeficit));

  const protein = Math.round(weight * 2);
  const proteinCalories = protein * 4;
  const remainingCalories = Math.max(targetCalories - proteinCalories, 0);
  const carbCalories = remainingCalories * 0.5;
  const fatCalories = remainingCalories * 0.5;
  const carbs = Math.round(carbCalories / 4);
  const fat = Math.round(fatCalories / 9);

  const fiber = getFiberByBMI(bmi);
  const water = Number(((weight * 35) / 1000).toFixed(1));

  return {
    calories: targetCalories,
    protein,
    fiber,
    water,
    carbs,
    fat,
  };
};

export const calculateNextDoseDate = (
  lastDoseDate: Date,
  frequency: string
): Date => {
  const next = new Date(lastDoseDate);
  
  switch (frequency) {
    case 'Diariamente':
      next.setDate(next.getDate() + 1);
      break;
    case 'Semanalmente':
      next.setDate(next.getDate() + 7);
      break;
    case 'A cada duas semanas':
      next.setDate(next.getDate() + 14);
      break;
    case 'Mensalmente':
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      next.setDate(next.getDate() + 7);
  }
  
  return next;
};

export const getTimeDifference = (date: Date): string => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return `${days}d ${hours}h`;
};

export const calculateAge = (birthDate: { day: number; month: number; year: number }): number => {
  const today = new Date();
  const birth = new Date(birthDate.year, birthDate.month, birthDate.day);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const formatDateOnly = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

export const calculateCaloriesBurned = (
  activity: 'walking' | 'running' | 'cycling',
  weight: number,
  duration: number // em minutos
): number => {
  const metValues = {
    walking: 3.5,
    running: 7.0,
    cycling: 4.0,
  };

  const met = metValues[activity];
  const caloriesPerMinute = (met * weight * 3.5) / 200;
  return Math.round(caloriesPerMinute * duration);
};
