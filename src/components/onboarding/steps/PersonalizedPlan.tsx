import { Button } from '@/components/ui/button';
import { Check, Calendar, Droplet, Flame, Beef, Wheat } from 'lucide-react';

interface PersonalizedPlanProps {
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  nextDoseDay: string;
  frequency: string;
  waterGoal: number;
  caloriesGoal: number;
  proteinGoal: number;
  fiberGoal: number;
  onContinue: () => void;
}

export const PersonalizedPlan = ({
  startWeight,
  currentWeight,
  targetWeight,
  nextDoseDay,
  frequency,
  waterGoal,
  caloriesGoal,
  proteinGoal,
  fiberGoal,
  onContinue,
}: PersonalizedPlanProps) => {
  const totalLoss = startWeight - targetWeight;
  const currentLoss = startWeight - currentWeight;
  const progressPercentage = (currentLoss / totalLoss) * 100;

  return (
    <div className="flex flex-col h-full py-8">
      <div className="space-y-6 flex-1 overflow-y-auto">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center mx-auto">
            <Check className="w-6 h-6 text-background" />
          </div>
          <h2 className="text-2xl font-bold">
            Seu Plano Personalizado
          </h2>
        </div>

        {/* Weight Progress Timeline */}
        <div className="bg-muted rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Calendar className="w-4 h-4" />
            <span>Linha do Tempo do seu Progresso</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Seu progresso desde o início do tratamento
          </p>
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{startWeight}kg</div>
              <div className="text-xs text-muted-foreground">Inicial</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{currentWeight}kg</div>
              <div className="text-xs text-muted-foreground">Peso Atual</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{targetWeight}kg</div>
              <div className="text-xs text-muted-foreground">15 de jan, de 2026</div>
            </div>
          </div>
        </div>

        {/* Próxima Aplicação e Água */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Calendar className="w-4 h-4" />
              <span>Próxima Aplicação</span>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold">{nextDoseDay}</div>
              <div className="text-xs text-muted-foreground">{frequency}</div>
            </div>
          </div>

          <div className="bg-muted rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Droplet className="w-4 h-4 text-blue-500" />
              <span>Água</span>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-12 h-16 bg-gradient-to-t from-blue-400/30 to-transparent rounded-lg border-2 border-blue-400/30">
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400 to-blue-300 rounded-b-lg" style={{ height: '60%' }}>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                    {waterGoal}L
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metas Nutricionais */}
        <div className="space-y-3">
          {/* Calorias e Proteína */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Calorias</span>
              </div>
              <div className="text-2xl font-bold">{caloriesGoal} kcal</div>
              <p className="text-xs text-muted-foreground">Alvo diário recomendado</p>
            </div>

            <div className="bg-muted rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Beef className="w-4 h-4 text-orange-600" />
                <span>Proteína</span>
              </div>
              <div className="text-2xl font-bold">{proteinGoal} g</div>
              <p className="text-xs text-muted-foreground">Consumo diário recomendado</p>
            </div>
          </div>

          {/* Fibras - card único centralizado */}
          <div className="bg-muted rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Wheat className="w-4 h-4 text-green-600" />
              <span>Fibras</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{fiberGoal} g</div>
                <p className="text-xs text-muted-foreground">Consumo diário recomendado</p>
              </div>
              <Wheat className="w-8 h-8 opacity-20 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={onContinue}
        className="w-full h-14 text-lg rounded-2xl mt-6"
        size="lg"
      >
        Continuar
      </Button>
    </div>
  );
};
