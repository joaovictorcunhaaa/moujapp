import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SmartWeightPicker } from '@/components/ui/SmartWeightPicker';

interface TargetWeightProps {
  value?: number;
  currentWeight?: number;
  suggestedWeight?: number;
  onSelect: (weight: number) => void;
  onContinue: () => void;
}

export const TargetWeight = ({ value, currentWeight = 70, suggestedWeight, onSelect, onContinue }: TargetWeightProps) => {
  // Inicializa já com a meta passada (sugerida por IMC, se disponível)
  const [weight, setWeight] = useState(value ?? currentWeight);

  // Sempre mantêm o estado sincronizado com o valor vindo de cima
  useEffect(() => {
    setWeight(value ?? currentWeight);
  }, [value, currentWeight]);

  const handleWeightChange = (newWeight: number) => {
    setWeight(newWeight);
    onSelect(newWeight);
  };

  const handleContinue = () => {
    onSelect(weight);
    onContinue();
  };

  // Delta relativo ao peso atual: negativo = perder, positivo = ganhar
  const delta = weight - currentWeight;

  return (
    <div className="flex flex-col h-full py-8">
      <div className="space-y-12 flex-1">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            Qual sua meta de peso atual?
          </h2>
          <p className="text-muted-foreground">
            Recalcularemos seu progresso e timeline
          </p>
        </div>

        <div className="space-y-6">
          <SmartWeightPicker
            value={weight}
            onChange={handleWeightChange}
            min={30}
            max={200}
            currentWeight={currentWeight}
            suggestedWeights={[
              ...(suggestedWeight ? [{ 
                label: `${suggestedWeight.toFixed(1)} kg`, 
                value: suggestedWeight, 
                description: 'IMC saudável' 
              }] : []),
              { label: `${(currentWeight - 5).toFixed(1)} kg`, value: currentWeight - 5, description: '-5kg' },
              { label: `${(currentWeight - 10).toFixed(1)} kg`, value: currentWeight - 10, description: '-10kg' },
              { label: `${(currentWeight + 5).toFixed(1)} kg`, value: currentWeight + 5, description: '+5kg' },
            ].filter(s => s.value >= 30 && s.value <= 200)}
          />
        </div>
      </div>

      <Button
        onClick={handleContinue}
        className="w-full h-14 text-lg rounded-2xl mt-8"
        size="lg"
      >
        Continuar
      </Button>
    </div>
  );
};
