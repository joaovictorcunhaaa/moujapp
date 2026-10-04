import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NativeDatePicker } from '@/components/ui/NativeDatePicker';

interface BirthDateProps {
  value?: { day: number; month: number; year: number };
  onSelect: (date: { day: number; month: number; year: number }) => void;
  onContinue: () => void;
}

export const BirthDate = ({ value, onSelect, onContinue }: BirthDateProps) => {
  const [selectedDate, setSelectedDate] = useState(value || { day: 15, month: 0, year: 1990 });

  const handleDateChange = (date: { day: number; month: number; year: number }) => {
    setSelectedDate(date);
    onSelect(date);
  };

  const handleContinue = () => {
    onSelect(selectedDate);
    onContinue();
  };

  return (
    <div className="flex flex-col h-full py-8">
      <div className="space-y-8 flex-1">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            Qual sua data de nascimento?
          </h2>
          <p className="text-muted-foreground">
            Cada fase da vida tem necessidades diferentes
          </p>
        </div>

        <NativeDatePicker
          value={selectedDate}
          onChange={handleDateChange}
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
