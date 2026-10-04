import { Button } from '@/components/ui/button';
import { OptionCard } from '../OptionCard';

const frequencies = [
  'Diariamente',
  'Semanalmente',
  'A cada duas semanas',
  'Mensalmente',
  'Ainda não sei',
];

interface FrequencySelectionProps {
  selected?: string;
  onSelect: (frequency: string) => void;
  onContinue: () => void;
}

export const FrequencySelection = ({ selected, onSelect, onContinue }: FrequencySelectionProps) => {
  return (
    <div className="flex flex-col h-full py-8">
      <div className="space-y-8 flex-1">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            Com que frequência você aplica?
          </h2>
          <p className="text-muted-foreground">
            Para enviar lembretes no horário certo
          </p>
        </div>

        <div className="space-y-3">
          {frequencies.map((freq) => (
            <OptionCard
              key={freq}
              selected={selected === freq}
              onClick={() => onSelect(freq)}
            >
              {freq}
            </OptionCard>
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
