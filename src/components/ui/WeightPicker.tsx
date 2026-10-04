import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface WeightPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const WeightPicker = ({ 
  value, 
  onChange, 
  min = 30, 
  max = 200, 
  step = 0.1, 
  className 
}: WeightPickerProps) => {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleSliderChange = (values: number[]) => {
    const newValue = Math.round(values[0] * 10) / 10; // Arredonda para 1 casa decimal
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  const handleInputBlur = () => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue < min || numValue > max) {
      setInputValue(value.toString());
    }
  };

  const adjustWeight = (delta: number) => {
    const newValue = Math.max(min, Math.min(max, value + delta));
    const roundedValue = Math.round(newValue * 10) / 10;
    onChange(roundedValue);
    setInputValue(roundedValue.toString());
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Display principal */}
      <div className="text-center">
        <div className="text-6xl font-bold text-primary mb-2">
          {value.toFixed(1)}
        </div>
        <div className="text-lg text-muted-foreground">kg</div>
      </div>

      {/* Controles de ajuste rápido */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => adjustWeight(-0.5)}
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
            min={min}
            max={max}
            step={step}
            className="text-center text-lg h-12"
            placeholder="Peso"
          />
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => adjustWeight(0.5)}
          className="h-12 w-12 rounded-full"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Slider principal */}
      <div className="px-4">
        <Slider
          value={[value]}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{min} kg</span>
          <span>{max} kg</span>
        </div>
      </div>

      {/* Botões de ajuste rápido */}
      <div className="grid grid-cols-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustWeight(-5)}
          className="text-xs"
        >
          -5kg
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustWeight(-1)}
          className="text-xs"
        >
          -1kg
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustWeight(1)}
          className="text-xs"
        >
          +1kg
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustWeight(5)}
          className="text-xs"
        >
          +5kg
        </Button>
      </div>
    </div>
  );
};