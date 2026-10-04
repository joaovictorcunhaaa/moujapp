import { Button } from '@/components/ui/button';
import { OptionCard } from '../OptionCard';
import { Bed, PersonStanding, Bike, Dumbbell, Flame } from 'lucide-react';

const activityLevels = [
  { value: 'sedentary', label: 'Sedentário', icon: <Bed className="w-5 h-5" /> },
  { value: 'lightly-active', label: 'Levemente ativo', icon: <PersonStanding className="w-5 h-5" /> },
  { value: 'moderately-active', label: 'Moderadamente ativo', icon: <Bike className="w-5 h-5" /> },
  { value: 'active', label: 'Ativo', icon: <Dumbbell className="w-5 h-5" /> },
  { value: 'very-active', label: 'Muito ativo', icon: <Flame className="w-5 h-5" /> },
];

interface ActivityLevelProps {
  selected?: string;
  onSelect: (level: string) => void;
  onContinue: () => void;
}

export const ActivityLevel = ({ selected, onSelect, onContinue }: ActivityLevelProps) => {
  return (
    <div className="flex flex-col h-full py-8">
      <div className="space-y-8 flex-1">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            Qual seu nível de atividade física?
          </h2>
          <p className="text-muted-foreground">
            Ajustaremos suas metas de calorias e peso
          </p>
        </div>

        <div className="space-y-3">
          {activityLevels.map((level) => (
            <OptionCard
              key={level.value}
              selected={selected === level.value}
              onClick={() => onSelect(level.value)}
              icon={level.icon}
            >
              {level.label}
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
