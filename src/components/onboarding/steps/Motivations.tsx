import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const motivationOptions = [
  'Eu quero me sentir mais confiante com meu próprio corpo',
  'Eu apenas quero um novo começo',
  'Eu quero melhorar minha energia e força',
  'Para melhorar minha saúde e gerenciar o GLP-1',
  'Eu quero fazer isso pelas pessoas que amo',
  'Eu tenho um evento especial chegando',
];

interface MotivationsProps {
  selected?: string[];
  onSelect: (motivations: string[]) => void;
  onContinue: () => void;
}

export const Motivations = ({ selected = [], onSelect, onContinue }: MotivationsProps) => {
  const [motivations, setMotivations] = useState<string[]>(selected);

  const toggleMotivation = (motivation: string) => {
    const newMotivations = motivations.includes(motivation)
      ? motivations.filter((m) => m !== motivation)
      : [...motivations, motivation];
    
    setMotivations(newMotivations);
    onSelect(newMotivations);
  };

  const handleContinue = () => {
    onSelect(motivations);
    onContinue();
  };

  return (
    <div className="flex flex-col h-full py-8">
      <div className="space-y-6 flex-1">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">
            O que está levando você a alcançar essa meta
          </h2>
          <p className="text-sm text-muted-foreground">
            Estou fazendo isso por...
          </p>
        </div>

        <div className="space-y-3">
          {motivationOptions.map((motivation) => {
            const isSelected = motivations.includes(motivation);
            return (
              <button
                key={motivation}
                onClick={() => toggleMotivation(motivation)}
                className={`w-full p-4 rounded-2xl text-left transition-all duration-200 text-sm font-medium flex items-start gap-3 ${
                  isSelected
                    ? 'bg-foreground/5 border-2 border-foreground'
                    : 'bg-muted border-2 border-transparent'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'bg-foreground border-foreground' : 'border-muted-foreground/30'
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-background" />}
                </div>
                <span>{motivation}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Button
        onClick={handleContinue}
        disabled={motivations.length === 0}
        className="w-full h-14 text-lg rounded-2xl mt-6"
        size="lg"
      >
        Continuar
      </Button>
    </div>
  );
};
