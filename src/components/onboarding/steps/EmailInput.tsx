import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EmailInputProps {
  value?: string;
  onSelect: (email: string) => void;
  onContinue: () => void;
  onSkip: () => void;
}

export const EmailInput = ({ value, onSelect, onContinue, onSkip }: EmailInputProps) => {
  const [email, setEmail] = useState(value || '');

  const handleContinue = () => {
    if (email.trim() && email.includes('@')) {
      onSelect(email.trim());
      onContinue();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
      <div className="space-y-8 flex-1 flex flex-col justify-center w-full max-w-sm">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            Qual é o seu email?
          </h2>
          <p className="text-muted-foreground">
            Para salvar seu progresso e enviar lembretes
          </p>
        </div>

        <Input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-14 rounded-2xl text-center text-lg"
          onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
        />
      </div>

      <div className="w-full space-y-3 mt-8">
        <Button
          onClick={handleContinue}
          disabled={!email.trim() || !email.includes('@')}
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
