import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Target } from 'lucide-react';

interface SmartWeightPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  currentWeight?: number;
  suggestedWeights?: { label: string; value: number; description?: string }[];
  className?: string;
}

export const SmartWeightPicker = ({ 
  value, 
  onChange, 
  min = 30, 
  max = 200, 
  step = 0.1,
  currentWeight,
  suggestedWeights = [],
  className 
}: SmartWeightPickerProps) => {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleSliderChange = (values: number[]) => {
    const newValue = Math.round(values[0] * 10) / 10;
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

  const selectSuggestedWeight = (suggestedValue: number) => {
    onChange(suggestedValue);
    setInputValue(suggestedValue.toString());
  };

  const delta = currentWeight ? value - currentWeight : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Display principal */}
      <div className="text-center space-y-2">
        <div className="text-6xl font-bold text-primary">
          {value.toFixed(1)}
        </div>
        <div className="text-lg text-muted-foreground">kg</div>
        
        {/* Delta em relação ao peso atual */}
        {currentWeight && delta !== 0 && (
          <div className="flex items-center justify-center space-x-2">
            <Badge variant={delta < 0 ? "destructive" : "default"} className="text-sm">
              {delta > 0 ? '+' : ''}{delta.toFixed(1)} kg
            </Badge>
            <span className="text-sm text-muted-foreground">
              {delta < 0 ? 'para perder' : 'para ganhar'}
            </span>
          </div>
        )}
      </div>

      {/* Sugestões rápidas */}
      {suggestedWeights.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-center">Sugestões</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestedWeights.map((suggestion, index) => (
              <Button
                key={index}
                variant={Math.abs(value - suggestion.value) < 0.1 ? "default" : "outline"}
                size="sm"
                onClick={() => selectSuggestedWeight(suggestion.value)}
                className="text-xs"
              >
                <Target className="w-3 h-3 mr-1" />
                {suggestion.label}
              </Button>
            ))}
          </div>
        </div>
      )}

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