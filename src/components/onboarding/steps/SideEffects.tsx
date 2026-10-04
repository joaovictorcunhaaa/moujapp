import { Button } from '@/components/ui/button';
import { OptionCard } from '../OptionCard';
import { Check } from 'lucide-react';

const sideEffects = [
  'Náusea',
  'Fadiga',
  'Constipação',
  'Diarreia',
  'Dor de cabeça',
  'Perda de apetite',
  'Refluxo',
];

interface SideEffectsProps {
  selected?: string;
  onSelect: (effect: string) => void;
  onContinue: () => void;
}

export const SideEffects = ({ selected, onSelect, onContinue }: SideEffectsProps) => {
  return (
    <div className="flex flex-col h-full py-8">
      <div className="space-y-8 flex-1">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            Qual efeito colateral você teve mais problema?
          </h2>
          <p className="text-muted-foreground">
            Deixe a gente saber para que a gente possa ajudar você a gerenciar melhor
          </p>
        </div>

        <div className="space-y-3">
          {sideEffects.map((effect) => (
            <button
              key={effect}
              onClick={() => onSelect(effect)}
              className={`w-full p-4 rounded-2xl text-left transition-all duration-200 font-medium flex items-center justify-between ${
                selected === effect
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-foreground'
              }`}
            >
              <span>{effect}</span>
              {selected === effect && <Check className="w-5 h-5" />}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={onContinue}
        disabled={!selected}
        className="w-full h-14 text-lg rounded-2xl mt-8"
        size="lg"
      >
        Continuar
      </Button>
    </div>
  );
};
