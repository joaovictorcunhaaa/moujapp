import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus } from 'lucide-react';

interface WeightLossSpeedProps {
  value?: number;
  onSelect: (speed: number) => void;
  onContinue: () => void;
}

export const WeightLossSpeed = ({ value, onSelect, onContinue }: WeightLossSpeedProps) => {
  const [speed, setSpeed] = useState(value || 0.9);
  const [inputValue, setInputValue] = useState((value || 0.9).toString());

  const handleSliderChange = (values: number[]) => {
    const newSpeed = Math.round(values[0] * 10) / 10;
    setSpeed(newSpeed);
    setInputValue(newSpeed.toString());
    onSelect(newSpeed);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 2.0) {
      setSpeed(numValue);
      onSelect(numValue);
    }
  };

  const handleInputBlur = () => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue < 0.1 || numValue > 2.0) {
      setInputValue(speed.toString());
    }
  };

  const adjustSpeed = (delta: number) => {
    const newSpeed = Math.max(0.1, Math.min(2.0, speed + delta));
    const roundedSpeed = Math.round(newSpeed * 10) / 10;
    setSpeed(roundedSpeed);
    setInputValue(roundedSpeed.toString());
    onSelect(roundedSpeed);
  };

  const selectPresetSpeed = (presetSpeed: number) => {
    setSpeed(presetSpeed);
    setInputValue(presetSpeed.toString());
    onSelect(presetSpeed);
  };

  const handleContinue = () => {
    onSelect(speed);
    onContinue();
  };

  return (
    <div className="flex flex-col h-full py-8">
      <div className="space-y-12 flex-1">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            Quão rápido você quer atingir a sua meta
          </h2>
          <p className="text-muted-foreground">
            Não se preocupe, vamos ajudar a manter o ritmo não importa a velocidade que você escolher
          </p>
        </div>

        <div className="space-y-8">
          {/* Speed Display */}
          <div className="text-center space-y-2">
            <div className="text-5xl font-bold text-primary">
              {speed.toFixed(1)}
            </div>
            <div className="text-lg text-muted-foreground">kg/semana</div>
            
            {/* Categoria da velocidade */}
            <div className="flex justify-center">
              {speed < 0.5 && <Badge variant="secondary">Muito Lento</Badge>}
              {speed >= 0.5 && speed < 0.8 && <Badge variant="outline">Lento</Badge>}
              {speed >= 0.8 && speed < 1.2 && <Badge variant="default">Moderado</Badge>}
              {speed >= 1.2 && speed < 1.6 && <Badge variant="destructive">Rápido</Badge>}
              {speed >= 1.6 && <Badge variant="destructive">Muito Rápido</Badge>}
            </div>
          </div>

          {/* Presets rápidos */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-center">Velocidades Comuns</div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={Math.abs(speed - 0.5) < 0.05 ? "default" : "outline"}
                size="sm"
                onClick={() => selectPresetSpeed(0.5)}
                className="text-xs flex flex-col h-auto py-2"
              >
                <span className="text-lg">🐌</span>
                <span>0.5 kg</span>
                <span className="text-xs opacity-70">Lento</span>
              </Button>
              <Button
                variant={Math.abs(speed - 0.9) < 0.05 ? "default" : "outline"}
                size="sm"
                onClick={() => selectPresetSpeed(0.9)}
                className="text-xs flex flex-col h-auto py-2"
              >
                <span className="text-lg">🦘</span>
                <span>0.9 kg</span>
                <span className="text-xs opacity-70">Moderado</span>
              </Button>
              <Button
                variant={Math.abs(speed - 1.3) < 0.05 ? "default" : "outline"}
                size="sm"
                onClick={() => selectPresetSpeed(1.3)}
                className="text-xs flex flex-col h-auto py-2"
              >
                <span className="text-lg">🚀</span>
                <span>1.3 kg</span>
                <span className="text-xs opacity-70">Rápido</span>
              </Button>
            </div>
          </div>

          {/* Controles de ajuste */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustSpeed(-0.1)}
              className="h-12 w-12 rounded-full"
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div className="w-32">
              <Input
                type="number"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                min={0.1}
                max={2.0}
                step={0.1}
                className="text-center text-lg h-12"
                placeholder="Velocidade"
              />
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustSpeed(0.1)}
              className="h-12 w-12 rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Slider */}
          <div className="px-4">
            <Slider
              value={[speed]}
              onValueChange={handleSliderChange}
              min={0.1}
              max={2.0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0.1 kg/sem</span>
              <span>2.0 kg/sem</span>
            </div>
          </div>

          {/* Botões de ajuste rápido */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustSpeed(-0.5)}
              className="text-xs"
            >
              -0.5
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustSpeed(-0.1)}
              className="text-xs"
            >
              -0.1
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustSpeed(0.1)}
              className="text-xs"
            >
              +0.1
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustSpeed(0.5)}
              className="text-xs"
            >
              +0.5
            </Button>
          </div>

          {/* Aviso baseado na velocidade */}
          <div className="bg-muted/50 rounded-xl p-4">
            {speed < 0.5 && (
              <p className="text-sm text-muted-foreground text-center">
                Ritmo muito lento pode ser desmotivante. Considere aumentar gradualmente.
              </p>
            )}
            {speed >= 0.5 && speed < 1.2 && (
              <p className="text-sm text-muted-foreground text-center">
                Ritmo saudável e sustentável. Ideal para mudanças duradouras.
              </p>
            )}
            {speed >= 1.2 && (
              <p className="text-sm text-muted-foreground text-center">
                Ritmo acelerado requer acompanhamento médico. Vamos ajudar você a se ajustar.
              </p>
            )}
          </div>
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
