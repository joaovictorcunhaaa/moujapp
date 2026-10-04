import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ReferralCodeProps {
  value?: string;
  onSelect: (code: string) => void;
  onContinue: () => void;
}

export const ReferralCode = ({ value, onSelect, onContinue }: ReferralCodeProps) => {
  const [code, setCode] = useState(value || '');

  const handleFinalize = () => {
    onSelect(code.trim());
    onContinue();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
      <div className="space-y-8 flex-1 flex flex-col justify-center w-full max-w-sm">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">
            Tem um código de indicação?
          </h2>
          <p className="text-muted-foreground text-sm">
            Deixe em branco se não tiver um cupom
          </p>
        </div>

        <Input
          type="text"
          placeholder="Digite o código (opcional)"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="h-14 rounded-2xl text-center text-lg uppercase"
          onKeyDown={(e) => e.key === 'Enter' && handleFinalize()}
        />
      </div>

      <div className="w-full mt-8">
        <Button
          onClick={handleFinalize}
          className="w-full h-14 text-lg rounded-2xl"
          size="lg"
        >
          Finalizar
        </Button>
      </div>
    </div>
  );
};
