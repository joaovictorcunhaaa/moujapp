import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Minus, Plus } from 'lucide-react';

interface NativeDatePickerProps {
  value?: { day: number; month: number; year: number };
  onChange: (date: { day: number; month: number; year: number }) => void;
  className?: string;
}

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const currentYear = new Date().getFullYear();

export const NativeDatePicker = ({ value, onChange, className }: NativeDatePickerProps) => {
  const [day, setDay] = useState(value?.day || 15);
  const [month, setMonth] = useState(value?.month || 0);
  const [year, setYear] = useState(value?.year || 1990);

  const handleDayChange = (newDay: number) => {
    setDay(newDay);
    onChange({ day: newDay, month, year });
  };

  const handleMonthChange = (newMonth: number) => {
    setMonth(newMonth);
    onChange({ day, month: newMonth, year });
  };

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    onChange({ day, month, year: newYear });
  };

  const adjustDay = (delta: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const newDay = Math.max(1, Math.min(daysInMonth, day + delta));
    handleDayChange(newDay);
  };

  const adjustMonth = (delta: number) => {
    const newMonth = Math.max(0, Math.min(11, month + delta));
    handleMonthChange(newMonth);
  };

  const adjustYear = (delta: number) => {
    const newYear = Math.max(1900, Math.min(currentYear, year + delta));
    handleYearChange(newYear);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Display da data selecionada */}
      <div className="text-center space-y-2">
        <div className="text-5xl font-bold text-primary">
          {String(day).padStart(2, '0')}
        </div>
        <div className="text-xl text-muted-foreground">
          {months[month]}
        </div>
        <div className="text-lg text-muted-foreground">
          {year}
        </div>
      </div>

      {/* Controles em grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Dia */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-center block">Dia</Label>
          <div className="flex flex-col items-center space-y-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustDay(1)}
              className="h-10 w-10 rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <div className="text-2xl font-bold text-center w-12">
              {String(day).padStart(2, '0')}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustDay(-1)}
              className="h-10 w-10 rounded-full"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mês */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-center block">Mês</Label>
          <div className="flex flex-col items-center space-y-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustMonth(1)}
              className="h-10 w-10 rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <div className="text-sm font-bold text-center h-12 flex items-center justify-center px-2">
              {months[month]}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustMonth(-1)}
              className="h-10 w-10 rounded-full"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Ano */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-center block">Ano</Label>
          <div className="flex flex-col items-center space-y-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustYear(1)}
              className="h-10 w-10 rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <div className="text-2xl font-bold text-center w-16">
              {year}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustYear(-1)}
              className="h-10 w-10 rounded-full"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Botões de ajuste rápido */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustYear(-10)}
            className="text-xs"
          >
            -10 anos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustYear(10)}
            className="text-xs"
          >
            +10 anos
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustDay(-7)}
            className="text-xs"
          >
            -1 semana
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date();
              handleDayChange(today.getDate());
              handleMonthChange(today.getMonth());
              handleYearChange(today.getFullYear() - 25);
            }}
            className="text-xs"
          >
            25 anos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustDay(7)}
            className="text-xs"
          >
            +1 semana
          </Button>
        </div>
      </div>

      {/* Validação visual */}
      {day > daysInMonth && (
        <div className="text-center text-sm text-destructive">
          {months[month]} de {year} tem apenas {daysInMonth} dias
        </div>
      )}
    </div>
  );
};