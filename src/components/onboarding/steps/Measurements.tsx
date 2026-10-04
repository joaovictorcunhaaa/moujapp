import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MeasurementPicker } from '@/components/ui/MeasurementPicker';

interface MeasurementsProps {
  value?: { height: number; weight: number };
  onSelect: (measurements: { height: number; weight: number }) => void;
  onContinue: () => void;
}

export const Measurements = ({ value, onSelect, onContinue }: MeasurementsProps) => {
  const [height, setHeight] = useState(value?.height || 169);
  const [weight, setWeight] = useState(value?.weight || 70);

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    onSelect({ height: newHeight, weight });
  };

  const handleWeightChange = (newWeight: number) => {
    setWeight(newWeight);
    onSelect({ height, weight: newWeight });
  };

  const handleContinue = () => {
    onSelect({ height, weight });
    onContinue();
  };

  return (
    <div className="flex flex-col h-full py-8">
      <div className="space-y-8 flex-1">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            Quais são suas medidas?
          </h2>
          <p className="text-muted-foreground">
            Sua altura e peso nos ajuda a calcular o seu IMC e personalizar sua nutrição e metas diárias
          </p>
        </div>

        <div className="space-y-8">
          <MeasurementPicker
            label="Altura"
            value={height}
            onChange={handleHeightChange}
            min={140}
            max={220}
            step={1}
            unit="cm"
          />
          
          <MeasurementPicker
            label="Peso"
            value={weight}
            onChange={handleWeightChange}
            min={30}
            max={200}
            step={0.1}
            unit="kg"
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
