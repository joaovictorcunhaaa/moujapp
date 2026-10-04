import { Button } from '@/components/ui/button';
import { OptionCard } from '../OptionCard';

const medications = [
  'Zepbound®',
  'Mounjaro®',
  'Ozempic®',
  'Wegovy®',
  'Trulicity®',
  'Saxenda®',
  'Victoza®',
];

interface MedicationSelectionProps {
  selected?: string;
  onSelect: (medication: string) => void;
  onContinue: () => void;
}

export const MedicationSelection = ({ selected, onSelect, onContinue }: MedicationSelectionProps) => {
  return (
    <div className="flex flex-col h-full py-8">
      <div className="space-y-8 flex-1">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            Qual medicamento GLP-1 você usa?
          </h2>
          <p className="text-muted-foreground">
            Se não estiver listado escolha "outro"
          </p>
        </div>

        <div className="space-y-3">
          {medications.map((med) => (
            <OptionCard
              key={med}
              selected={selected === med}
              onClick={() => onSelect(med)}
            >
              {med}
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
