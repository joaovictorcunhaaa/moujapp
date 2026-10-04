import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Minus, Plus } from 'lucide-react';

interface MobileDatePickerProps {
  value?: { day: number; month: number; year: number };
  onChange: (date: { day: number; month: number; year: number }) => void;
  className?: string;
}

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

export const MobileDatePicker = ({ value, onChange, className }: MobileDatePickerProps) => {
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

  const adjustYear = (delta: number) => {
    const newYear = Math.max(1900, Math.min(currentYear, year + delta));
    handleYearChange(newYear);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Display da data selecionada */}
      <div className="text-center">
        <div className="text-4xl font-bold text-primary">
          {String(day).padStart(2, '0')}
        </div>
        <div className="text-lg text-muted-foreground">
          {months[month]} de {year}
        </div>
      </div>

      {/* Seletor de Dia */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Dia</Label>
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => adjustDay(-1)}
            className="h-12 w-12 rounded-full"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <div className="w-32">
            <Select value={day.toString()} onValueChange={(value) => handleDayChange(Number(value))}>
              <SelectTrigger className="text-center text-lg h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dayOptions.map((d) => (
                  <SelectItem key={d} value={d.toString()}>
                    {String(d).padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => adjustDay(1)}
            className="h-12 w-12 rounded-full"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Seletor de Mês */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Mês</Label>
        <Select value={month.toString()} onValueChange={(value) => handleMonthChange(Number(value))}>
          <SelectTrigger className="text-center text-lg h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((monthName, index) => (
              <SelectItem key={index} value={index.toString()}>
                {monthName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Seletor de Ano */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Ano</Label>
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => adjustYear(-1)}
            className="h-12 w-12 rounded-full"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <div className="w-32">
            <Select value={year.toString()} onValueChange={(value) => handleYearChange(Number(value))}>
              <SelectTrigger className="text-center text-lg h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => adjustYear(1)}
            className="h-12 w-12 rounded-full"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Botões de ajuste rápido para ano */}
      <div className="grid grid-cols-4 gap-2">
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
          onClick={() => adjustYear(-5)}
          className="text-xs"
        >
          -5 anos
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustYear(5)}
          className="text-xs"
        >
          +5 anos
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
    </div>
  );
};