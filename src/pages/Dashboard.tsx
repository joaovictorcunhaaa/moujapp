import { useOnboarding } from '@/hooks/useOnboarding';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Package,
  Scale,
  Calendar,
  TrendingDown,
  Pencil,
  CheckCircle,
  Syringe,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { calculateBMI, calculateAge, calculateNextDoseDate, formatDateOnly } from '@/utils/calculations';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { useDoses } from '@/hooks/useDoses';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

// Função para traduzir níveis de atividade
const getActivityLevelLabel = (activityLevel?: string): string => {
  const activityLabels: Record<string, string> = {
    'sedentary': 'Sedentário',
    'lightly-active': 'Levemente ativo',
    'moderately-active': 'Moderadamente ativo',
    'very-active': 'Muito ativo',
    'extremely-active': 'Extremamente ativo'
  };
  return activityLabels[activityLevel || ''] || activityLevel || '';
};

const Dashboard = () => {
  const { data, resetOnboarding, updateData } = useOnboarding();
  const { lastDose, clearDoses } = useDoses();
  const [editWeightOpen, setEditWeightOpen] = useState(false);
  const [newWeight, setNewWeight] = useState<number | ''>(data.weight ?? '');
  const navigate = useNavigate();

  const handleReset = () => {
    // Limpar caches e histórico
    try {
      // Zera registros de doses e limpa chave
      clearDoses();
      localStorage.removeItem('moujapp-doses');
      // Remove Lifestyle (inclui histórico de análises, água, atividade)
      localStorage.removeItem('moujapp-lifestyle');
    } catch {}
    // Resetar onboarding e voltar ao fluxo inicial
    resetOnboarding();
    navigate('/onboarding');
  };

  // Calculations
  const bmi = data.height && data.weight ? calculateBMI(data.weight, data.height) : null;
  const age = data.birthDate ? calculateAge(data.birthDate) : 25;
  
  const weightProgressRaw =
    data.startWeight && data.targetWeight && data.weight && data.startWeight !== data.targetWeight
      ? ((data.startWeight - data.weight) / (data.startWeight - data.targetWeight)) * 100
      : 0;
  const weightProgress = Math.max(0, Math.min(weightProgressRaw, 100));

  const goalReached = typeof data.targetWeight === 'number' && typeof data.weight === 'number'
    ? data.weight <= data.targetWeight
    : false;

  const weightIncreased = typeof data.startWeight === 'number' && typeof data.weight === 'number'
    ? data.weight > data.startWeight
    : false;

  const handleSaveWeight = () => {
    const parsed = typeof newWeight === 'string' ? parseFloat(newWeight) : newWeight;
    if (!isNaN(parsed) && parsed > 0) {
      updateData({ weight: parsed });
      setEditWeightOpen(false);
    }
  };

  const lastDoseDate = lastDose ? new Date(lastDose.dateISO) : null;
  const nextDoseDate = lastDoseDate && data.frequency ? calculateNextDoseDate(lastDoseDate, data.frequency) : null;
  const timeUntilNext = nextDoseDate ? formatDateOnly(nextDoseDate) : '--';

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">MoujApp</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta! 👋
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-2xl p-4 space-y-2 relative">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <button
              aria-label="Editar peso"
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              onClick={() => { setNewWeight(data.weight ?? ''); setEditWeightOpen(true); }}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <div>
              <p className="text-2xl font-bold">{data.weight || '--'} kg</p>
              <p className="text-sm text-muted-foreground">Peso Atual</p>
            </div>
          </div>

          <div className="bg-muted rounded-2xl p-4 space-y-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{bmi || '--'}</p>
              <p className="text-sm text-muted-foreground">IMC</p>
            </div>
          </div>
        </div>

        {/* Weight Progress */}
        {data.startWeight && data.targetWeight && (
          <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Progresso de Peso</h3>
              <span className="text-sm text-primary font-medium">
                {Math.round(weightProgress)}% da meta
              </span>
            </div>
            <Progress value={weightProgress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{data.startWeight}kg (inicial)</span>
              <span>{data.targetWeight}kg (meta)</span>
            </div>
          </div>
        )}

        {/* Goal Reached Card */}
        {goalReached && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <CheckCircle className="w-5 h-5" />
              <h3 className="font-semibold">Meta atingida!</h3>
            </div>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Parabéns! Você atingiu sua meta de peso.
            </p>
            <div className="flex justify-between text-sm text-emerald-700 dark:text-emerald-300">
              <span>Atual: {data.weight}kg</span>
              <span>Meta: {data.targetWeight}kg</span>
            </div>
          </div>
        )}

        {/* Medication Info */}
        <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Seu Medicamento</h3>
          </div>
          <div className="space-y-2">
            <p className="font-medium">{data.medication || 'Não informado'}</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Dose: {data.currentDose || '--'}</span>
              <span>Frequência: {data.frequency || '--'}</span>
            </div>
          </div>
        </div>

        {/* Next Application with Countdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <h3 className="text-sm font-semibold">Última dose</h3>
            </div>
            {lastDoseDate ? (
              <p className="text-xl font-bold">{formatDateOnly(lastDoseDate)}</p>
            ) : (
              <div className="mt-1 flex items-center gap-2">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openQuickAddDose'))}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full border bg-primary/10 text-primary hover:bg-primary/20"
                  aria-label="Adicionar primeira dose"
                >
                  <Syringe className="w-7 h-7" />
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openQuickAddDose'))}
                  className="text-sm text-primary"
                >
                  Adicionar dose
                </button>
              </div>
            )}
          </div>

          <div className="bg-muted rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-destructive" />
              <h3 className="text-sm font-semibold">Próxima dose</h3>
            </div>
            {nextDoseDate ? (
              <>
                <p className="text-xl font-bold">{timeUntilNext}</p>
                <div className="relative w-16 h-16">
                  <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      className="text-border"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * 0.3}`}
                      className="text-primary"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                    {/* Countdown */}
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-1 flex items-center gap-2">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openQuickAddDose'))}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full border bg-primary/10 text-primary hover:bg-primary/20"
                  aria-label="Adicionar primeira dose"
                >
                  <Syringe className="w-7 h-7" />
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openQuickAddDose'))}
                  className="text-sm text-primary"
                >
                  Adicionar dose
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Summary */}
        <div className="bg-muted rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold">Resumo do Perfil</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Idade:</span>
              <span className="font-medium">{age} anos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Altura:</span>
              <span className="font-medium">{data.height || '--'} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Atividade:</span>
              <span className="font-medium">{getActivityLevelLabel(data.activityLevel) || '--'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Velocidade:</span>
              <span className="font-medium">{data.weightLossSpeed || '--'} kg/semana</span>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/onboarding')}
              className="flex-1"
            >
              Meu Perfil
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex-1"
            >
              Reiniciar
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />

      {/* Edit Weight Dialog */}
      <Dialog open={editWeightOpen} onOpenChange={setEditWeightOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Peso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Novo peso (kg)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="Ex: 75.5"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditWeightOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveWeight} className="flex-1">
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
