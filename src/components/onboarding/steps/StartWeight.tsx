import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WeightPicker } from '@/components/ui/WeightPicker';

interface StartWeightProps {
  value?: number;
  onSelect: (weight: number) => void;
  onContinue: () => void;
}

export const StartWeight = ({ value, onSelect, onContinue }: StartWeightProps) => {
  const [weight, setWeight] = useState(value || 71);

  const handleWeightChange = (newWeight: number) => {
    setWeight(newWeight);
    onSelect(newWeight);
  };

  const handleContinue = () => {
    onSelect(weight);
    onContinue();
  };

  return (
    <div className="flex flex-col h-full py-8">
      <div className="space-y-12 flex-1">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            Qual o peso de quando você começou?
          </h2>
          <p className="text-muted-foreground">
            Isso vai ajudar a personalizarmos o seu acompanhamento dentro do app
          </p>
        </div>

        <WeightPicker
          value={weight}
          onChange={handleWeightChange}
          min={30}
          max={200}
        />
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
