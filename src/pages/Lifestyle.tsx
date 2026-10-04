import BottomNav from '@/components/BottomNav';
import {
  ArrowLeft,
  Bike,
  Beef,
  Droplet,
  Flame,
  Footprints,
  Leaf,
  Minus,
  Plus,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  calculateAge,
  calculateCaloriesBurned,
  calculateBMI,
  calculateTMB,
  calculateTDEE,
  calculateNutritionalGoalsFromTDEE,
} from '@/utils/calculations';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AnalysisEntry } from '@/types/analysis';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

// Funções auxiliares para cálculo de passos/pedaladas
const calculateSteps = (activity: 'walking' | 'running' | 'cycling', duration: number) => {
  switch (activity) {
    case 'walking':
      return Math.round(duration * 100); // 100 passos por minuto (caminhada normal)
    case 'running':
      return Math.round(duration * 180); // 180 passos por minuto (corrida)
    case 'cycling':
      return Math.round(duration * 2.5); // 2.5 pedaladas por minuto (média)
    default:
      return 0;
  }
};

const getActivityLabel = (activity: 'walking' | 'running' | 'cycling') => {
  switch (activity) {
    case 'walking':
      return 'Passos';
    case 'running':
      return 'Passos';
    case 'cycling':
      return 'Pedaladas';
    default:
      return 'Passos';
  }
};

const Lifestyle = () => {
  const navigate = useNavigate();
  const { data } = useOnboarding();
  const [water, setWater] = useState(1.0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0); // Começa com zero
  const [currentSteps, setCurrentSteps] = useState(0); // Começa com zero
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<'walking' | 'running' | 'cycling' | null>(null);
  const [duration, setDuration] = useState<number | ''>(30);
  const [hydrated, setHydrated] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisEntry[]>([]);

  // Hidratação inicial do cache (localStorage)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('moujapp-lifestyle');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.water === 'number') setWater(parsed.water);
        if (typeof parsed.caloriesBurned === 'number') setCaloriesBurned(parsed.caloriesBurned);
        if (typeof parsed.totalDuration === 'number') setTotalDuration(parsed.totalDuration);
        if (typeof parsed.currentSteps === 'number') setCurrentSteps(parsed.currentSteps);
        if (Array.isArray(parsed.analysisHistory)) setAnalysisHistory(parsed.analysisHistory as AnalysisEntry[]);
        if (
          parsed.selectedActivity === 'walking' ||
          parsed.selectedActivity === 'running' ||
          parsed.selectedActivity === 'cycling' ||
          parsed.selectedActivity === null
        ) {
          setSelectedActivity(parsed.selectedActivity);
        }
        if (typeof parsed.duration === 'number' || parsed.duration === '') setDuration(parsed.duration);
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persistência no cache após qualquer alteração relevante
  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload = {
        water,
        caloriesBurned,
        totalDuration,
        currentSteps,
        selectedActivity,
        duration,
        analysisHistory,
      };
      localStorage.setItem('moujapp-lifestyle', JSON.stringify(payload));
    } catch {}
  }, [hydrated, water, caloriesBurned, totalDuration, currentSteps, selectedActivity, duration, analysisHistory]);

  const handleActivityClick = (activity: 'walking' | 'running' | 'cycling') => {
    setSelectedActivity(activity);
    setActivityDialogOpen(true);
  };

  const handleSaveActivity = () => {
    if (selectedActivity && duration && data.weight) {
      const calories = calculateCaloriesBurned(selectedActivity, data.weight, Number(duration));
      const steps = calculateSteps(selectedActivity, Number(duration));
      
      setCaloriesBurned((prev) => prev + calories);
      setTotalDuration((prev) => prev + Number(duration));
      setCurrentSteps((prev) => prev + steps);
      
      // Fechar dialog e resetar duração para próxima vez
      setActivityDialogOpen(false);
      setDuration(30);
    }
  };

  const handleResetActivity = () => {
    setCaloriesBurned(0);
    setTotalDuration(0);
    setCurrentSteps(0);
    setSelectedActivity(null);
    // Manter a duração padrão após reset (não obrigatório, mas prático)
    setDuration(30);
  };

  const handleClearAnalysisHistory = () => {
    setAnalysisHistory([]);
  };

  const age = data.birthDate ? calculateAge(data.birthDate) : 25;

  // TMB/TDEE com Mifflin-St Jeor
  const tmb = data.weight && data.height
    ? Math.round(calculateTMB(data.weight, data.height, age, data.gender || 'female'))
    : undefined;
  const tdee = typeof tmb === 'number'
    ? Math.round(calculateTDEE(tmb, data.activityLevel || 'sedentary'))
    : undefined;

  // Mapear velocidade de perda (kg/semana) para déficit percentual
  const mapSpeedToDeficitPercent = (speed?: number): number => {
    if (!speed || speed <= 0) return 0.15; // padrão: 15%
    if (speed < 0.6) return 0.10;
    if (speed < 1.0) return 0.15;
    return 0.20;
  };
  const deficitPercent = mapSpeedToDeficitPercent(data.weightLossSpeed);

  const goals = data.weight && data.height && typeof tdee === 'number'
    ? calculateNutritionalGoalsFromTDEE(
        data.weight,
        data.height,
        age,
        data.gender || 'female',
        data.activityLevel || 'sedentary',
        deficitPercent
      )
    : {
        calories: 2000,
        protein: 130,
        fiber: 25,
        water: 2.0,
        carbs: 200,
        fat: 70,
      };

  // IMC (exibição informativa)
  const bmi = data.weight && data.height ? calculateBMI(data.weight, data.height) : undefined;

  // Consumo calórico do dia baseado nas análises salvas
  const consumedCaloriesToday = analysisHistory
    .filter((e) => {
      const d = new Date(e.createdAt);
      const now = new Date();
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    })
    .reduce((sum, e) => sum + (Number(e.nutrients?.kcal) || 0), 0);
  const remainingCaloriesToday = Math.max(goals.calories - consumedCaloriesToday, 0);

  // Consumos agregados de macros a partir das análises do dia
  const consumedCarbsToday = analysisHistory
    .filter((e) => {
      const d = new Date(e.createdAt);
      const now = new Date();
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    })
    .reduce((sum, e) => sum + (Number(e.nutrients?.carbs) || 0), 0);
  const consumedFatToday = analysisHistory
    .filter((e) => {
      const d = new Date(e.createdAt);
      const now = new Date();
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    })
    .reduce((sum, e) => sum + (Number(e.nutrients?.fat) || 0), 0);
  const consumedProteinToday = analysisHistory
    .filter((e) => {
      const d = new Date(e.createdAt);
      const now = new Date();
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    })
    .reduce((sum, e) => sum + (Number(e.nutrients?.protein) || 0), 0);
  const consumedFiberToday = analysisHistory
    .filter((e) => {
      const d = new Date(e.createdAt);
      const now = new Date();
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    })
    .reduce((sum, e) => sum + (Number(e.nutrients?.fiber) || 0), 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-full border hover:bg-accent hover:text-accent-foreground"
            aria-label="Voltar para o dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Estilo de Vida</h1>
            <p className="text-muted-foreground">Hábitos e metas do dia a dia.</p>
          </div>
        </div>

        {/* Placeholders */}
        <div className="grid grid-cols-2 gap-4">
          {/* Protein */}
          <div className="bg-muted rounded-2xl p-4 space-y-2 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Beef className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold">Proteína</h3>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-28 h-28">
                <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-border"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 45 * (1 - clamp(consumedProteinToday / goals.protein, 0, 1))
                    }`}
                    className="text-orange-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{consumedProteinToday}</span>
                  <span className="text-sm text-muted-foreground">/ {goals.protein}g</span>
                </div>
              </div>
            </div>
            {/* Consumo de proteína vem das análises do dia */}
          </div>

          <div className="space-y-4">
            {/* Fiber */}
            <div className="bg-muted rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold">Fibra</h3>
                </div>
              </div>
              <div>
                <p className="text-lg font-bold mb-1">
                  {consumedFiberToday}g <span className="text-sm text-muted-foreground">/ {goals.fiber}g</span>
                </p>
                {/* barra do indicador em verde para combinar com a folha */}
                <Progress value={(consumedFiberToday / goals.fiber) * 100} className="h-2 [&>div]:bg-green-500" />
              </div>
            </div>

            {/* Water */}
            <div className="bg-muted rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold">Água</h3>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="relative w-16 h-20 bg-muted rounded-t-xl border-2 border-b-0 border-border overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-blue-400 transition-all duration-300"
                    style={{ height: `${clamp((water / goals.water) * 100, 0, 100)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-black">
                      {water.toFixed(1)}L
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full w-9 h-9"
                    onClick={() => setWater((w) => clamp(w + 0.1, 0, 10))}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                  <span className="font-medium text-sm text-muted-foreground">100ml</span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full w-9 h-9"
                    onClick={() => setWater((w) => clamp(w - 0.1, 0, 10))}
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Stats */}
        <div className="bg-muted rounded-2xl p-5 space-y-3">
          <h3 className="font-semibold">Outros</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Calorias (TDEE - déficit):</span>
              <span className="font-medium">{consumedCaloriesToday} / {goals.calories} kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TMB (Mifflin-St Jeor):</span>
              <span className="font-medium">{typeof tmb === 'number' ? tmb : '--'} kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TDEE (atividade):</span>
              <span className="font-medium">{typeof tdee === 'number' ? tdee : '--'} kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Déficit aplicado:</span>
              <span className="font-medium">{Math.round(deficitPercent * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IMC:</span>
              <span className="font-medium">{typeof bmi === 'number' ? bmi.toFixed(2) : '--'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Restante hoje:</span>
              <span className={`font-medium ${remainingCaloriesToday === 0 ? 'text-green-600' : ''}`}>{remainingCaloriesToday} kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Proteína:</span>
              <span className="font-medium">{consumedProteinToday} / {goals.protein} g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fibra:</span>
              <span className="font-medium">{consumedFiberToday} / {goals.fiber} g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Carboidratos:</span>
              <span className="font-medium">{consumedCarbsToday} / {goals.carbs} g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gordura:</span>
              <span className="font-medium">{consumedFatToday} / {goals.fat} g</span>
            </div>
          </div>
        </div>

        {/* Analysis History */}
        <div className="bg-muted rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Histórico de Análises</h3>
            {analysisHistory.length > 0 && (
              <button
                onClick={handleClearAnalysisHistory}
                className="text-xs text-muted-foreground hover:underline"
                aria-label="Limpar histórico de análises"
              >
                Limpar
              </button>
            )}
          </div>
          {analysisHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma análise registrada ainda.</p>
          ) : (
            <div className="space-y-2">
              {analysisHistory.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 rounded-xl border p-3 bg-background/50">
                  {entry.imageDataUrl && (
                    <img
                      src={entry.imageDataUrl}
                      alt={entry.name || 'Prato analisado'}
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{entry.name || 'Prato analisado'}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs mt-1">
                      <div className="flex justify-between"><span>kcal</span><span className="font-medium">{entry.nutrients?.kcal ?? '--'}</span></div>
                      <div className="flex justify-between"><span>Prot</span><span className="font-medium">{entry.nutrients?.protein ?? '--'}g</span></div>
                      <div className="flex justify-between"><span>Carb</span><span className="font-medium">{entry.nutrients?.carbs ?? '--'}g</span></div>
                      <div className="flex justify-between"><span>Gord</span><span className="font-medium">{entry.nutrients?.fat ?? '--'}g</span></div>
                    </div>
                    {typeof entry.healthScore === 'number' && (
                      <div className="text-xs text-muted-foreground mt-1">Health Score: <span className="font-medium">{entry.healthScore}/100</span></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Physical Activity */}
        <div className="bg-muted rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold">Atividade Física</h3>
            </div>
            <button
              onClick={handleResetActivity}
              className="p-1.5 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Zerar atividade física"
              title="Zerar atividade física"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold">{currentSteps.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedActivity ? getActivityLabel(selectedActivity) : 'Passos'}
              </p>
            </div>
            <div>
              <p className="text-xl font-bold">{totalDuration}</p>
              <p className="text-sm text-muted-foreground">min</p>
            </div>
            <div>
              <p className="text-xl font-bold">{Math.round(caloriesBurned)}</p>
              <p className="text-sm text-muted-foreground">kcal</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-2">
            <button
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                selectedActivity === 'walking'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
              onClick={() => handleActivityClick('walking')}
            >
              <Footprints className="w-6 h-6" />
              <span className="text-xs font-medium">Caminhada</span>
            </button>
            <button
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                selectedActivity === 'running'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
              onClick={() => handleActivityClick('running')}
            >
              <Zap className="w-6 h-6" />
              <span className="text-xs font-medium">Corrida</span>
            </button>
            <button
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                selectedActivity === 'cycling'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
              onClick={() => handleActivityClick('cycling')}
            >
              <Bike className="w-6 h-6" />
              <span className="text-xs font-medium">Bicicleta</span>
            </button>
          </div>
        </div>
      </div>

      <BottomNav />

      {/* Activity Duration Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedActivity === 'walking' && 'Caminhada'}
              {selectedActivity === 'running' && 'Corrida'}
              {selectedActivity === 'cycling' && 'Bicicleta'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Duração (minutos)</label>
              <Input
                type="number"
                placeholder="Ex: 30"
                value={duration}
                onChange={(e) => setDuration(e.target.value === '' ? '' : parseInt(e.target.value))}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setActivityDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveActivity} className="flex-1">
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Lifestyle;