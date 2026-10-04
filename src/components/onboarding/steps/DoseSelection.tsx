import { Button } from '@/components/ui/button';
import { OptionCard } from '../OptionCard';

const doses = [
  '2,5 mg',
  '5 mg',
  '7,5 mg',
  '10 mg',
  '12,5 mg',
  '15 mg',
  'Dose personalizada',
];

interface DoseSelectionProps {
  selected?: string;
  onSelect: (dose: string) => void;
  onContinue: () => void;
}

export const DoseSelection = ({ selected, onSelect, onContinue }: DoseSelectionProps) => {
  return (
    <div className="flex flex-col h-full py-8">
      <div className="space-y-8 flex-1">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            Qual é sua dose atual?
          </h2>
          <p className="text-muted-foreground">
            Vamos ajustar o acompanhamento para sua dose
          </p>
        </div>

        <div className="space-y-3">
          {doses.map((dose) => (
            <OptionCard
              key={dose}
              selected={selected === dose}
              onClick={() => onSelect(dose)}
            >
              {dose}
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
