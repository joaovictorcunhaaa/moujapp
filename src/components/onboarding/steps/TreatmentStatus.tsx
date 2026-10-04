import { Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OptionCard } from '../OptionCard';

interface TreatmentStatusProps {
  selected?: string;
  onSelect: (status: 'already-using' | 'want-to-start') => void;
  onContinue: () => void;
}

export const TreatmentStatus = ({ selected, onSelect, onContinue }: TreatmentStatusProps) => {
  return (
    <div className="flex flex-col h-full py-8">
      <div className="space-y-8 flex-1">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            Pronto para se sentir você novamente?
          </h2>
          <p className="text-muted-foreground">
            Onde você está na sua jornada GLP-1?
          </p>
        </div>

        <div className="space-y-3">
          <OptionCard
            selected={selected === 'already-using'}
            onClick={() => onSelect('already-using')}
            icon={<Loader2 className="w-5 h-5" />}
          >
            Já estou usando GLP-1
          </OptionCard>

          <OptionCard
            selected={selected === 'want-to-start'}
            onClick={() => onSelect('want-to-start')}
            icon={<Play className="w-5 h-5" />}
          >
            Quero começar com GLP-1
          </OptionCard>
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
