import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface MeasurementPickerProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
  className?: string;
}

export const MeasurementPicker = ({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step = 1, 
  unit, 
  className 
}: MeasurementPickerProps) => {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleSliderChange = (values: number[]) => {
    const newValue = unit === 'kg' ? Math.round(values[0] * 10) / 10 : Math.round(values[0]);
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

  const adjustValue = (delta: number) => {
    const newValue = Math.max(min, Math.min(max, value + delta));
    const roundedValue = unit === 'kg' ? Math.round(newValue * 10) / 10 : Math.round(newValue);
    onChange(roundedValue);
    setInputValue(roundedValue.toString());
  };

  // Definir incrementos baseados na unidade
  const smallIncrement = unit === 'kg' ? 0.5 : 1;
  const largeIncrement = unit === 'kg' ? 5 : 10;

  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>
      
      {/* Display atual */}
      <div className="text-center">
        <div className="text-4xl font-bold text-primary">
          {unit === 'kg' ? value.toFixed(1) : value} {unit}
        </div>
      </div>

      {/* Controles de ajuste rápido */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => adjustValue(-smallIncrement)}
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
            placeholder={label}
          />
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => adjustValue(smallIncrement)}
          className="h-12 w-12 rounded-full"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Slider */}
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
          <span>{min} {unit}</span>
          <span>{max} {unit}</span>
        </div>
      </div>

      {/* Botões de ajuste rápido */}
      <div className="grid grid-cols-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustValue(-largeIncrement)}
          className="text-xs"
        >
          -{largeIncrement}{unit}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustValue(-smallIncrement)}
          className="text-xs"
        >
          -{smallIncrement}{unit}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustValue(smallIncrement)}
          className="text-xs"
        >
          +{smallIncrement}{unit}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustValue(largeIncrement)}
          className="text-xs"
        >
          +{largeIncrement}{unit}
        </Button>
      </div>
    </div>
  );
};