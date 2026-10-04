import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NameInputProps {
  value?: string;
  onSelect: (name: string) => void;
  onContinue: () => void;
  onSkip: () => void;
}

export const NameInput = ({ value, onSelect, onContinue, onSkip }: NameInputProps) => {
  const [name, setName] = useState(value || '');

  const handleContinue = () => {
    if (name.trim()) {
      onSelect(name.trim());
      onContinue();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
      <div className="space-y-8 flex-1 flex flex-col justify-center w-full max-w-sm">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            Como você se chama?
          </h2>
          <p className="text-muted-foreground">
            Vamos personalizar sua experiência
          </p>
        </div>

        <Input
          type="text"
          placeholder="Digite seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-14 rounded-2xl text-center text-lg"
          onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
        />
      </div>

      <div className="w-full space-y-3 mt-8">
        <Button
          onClick={handleContinue}
          disabled={!name.trim()}
          className="w-full h-14 text-lg rounded-2xl"
          size="lg"
        >
          Continuar
        </Button>
        <button
          onClick={onSkip}
          className="w-full text-muted-foreground hover:text-foreground transition-colors"
        >
          Pular
        </button>
      </div>
    </div>
  );
};
