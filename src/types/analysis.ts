export type AnalysisEntry = {
  id: string;
  createdAt: number;
  imageDataUrl: string | null;
  name?: string;
  healthScore?: number;
  processingLevel?: string;
  nutrients?: { kcal: number; protein: number; carbs: number; fat: number; fiber?: number };
};