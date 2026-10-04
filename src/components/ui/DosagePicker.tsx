import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface DosagePickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const DosagePicker = ({ 
  value, 
  onChange, 
  min = 0.01, 
  max = 50, 
  step = 0.25, 
  className 
}: DosagePickerProps) => {
  const [inputValue, setInputValue] = useState(value.toString());

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

  const adjustDosage = (delta: number) => {
    const newValue = Math.max(min, Math.min(max, value + delta));
    const roundedValue = Math.round(newValue * 100) / 100; // 2 casas decimais
    onChange(roundedValue);
    setInputValue(roundedValue.toString());
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Display atual */}
      <div className="text-center">
        <div className="text-3xl font-bold text-primary">
          {value.toFixed(2)} mg
        </div>
      </div>

      {/* Controles de ajuste */}
      <div className="flex items-center justify-center space-x-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => adjustDosage(-step)}
          className="h-10 w-10 rounded-full"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <div className="w-24">
          <Input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            min={min}
            max={max}
            step={step}
            className="text-center text-lg h-10"
            placeholder="Dosagem"
          />
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => adjustDosage(step)}
          className="h-10 w-10 rounded-full"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Botões de ajuste rápido */}
      <div className="grid grid-cols-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustDosage(-1)}
          className="text-xs"
        >
          -1mg
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustDosage(-0.25)}
          className="text-xs"
        >
          -0.25
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustDosage(0.25)}
          className="text-xs"
        >
          +0.25
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustDosage(1)}
          className="text-xs"
        >
          +1mg
        </Button>
      </div>
    </div>
  );
};