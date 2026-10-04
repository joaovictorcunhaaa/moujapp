import { Button } from '@/components/ui/button';
import { OptionCard } from '../OptionCard';

const genders = [
  { value: 'male', label: 'Masculino', icon: '♂️' },
  { value: 'female', label: 'Feminino', icon: '♀️' },
  { value: 'other', label: 'Outro', icon: '' },
  { value: 'prefer-not-to-say', label: 'Prefiro não dizer', icon: '' },
];

interface GenderSelectionProps {
  selected?: string;
  onSelect: (gender: string) => void;
  onContinue: () => void;
}

export const GenderSelection = ({ selected, onSelect, onContinue }: GenderSelectionProps) => {
  return (
    <div className="flex flex-col h-full py-8">
      <div className="space-y-8 flex-1">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            Como você se identifica?
          </h2>
          <p className="text-muted-foreground">
            Usamos alguns detalhes simples para melhorar seu acompanhamento nutricional, 
            atividade física e plano de atividades. Tudo baseado em como seu corpo funciona
          </p>
        </div>

        <div className="space-y-3">
          {genders.map((gender) => (
            <OptionCard
              key={gender.value}
              selected={selected === gender.value}
              onClick={() => onSelect(gender.value)}
              icon={gender.icon}
            >
              {gender.label}
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
