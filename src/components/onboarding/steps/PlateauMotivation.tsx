import { Button } from '@/components/ui/button';

interface PlateauMotivationProps {
  weightToLose?: number;
  onContinue: () => void;
}

export const PlateauMotivation = ({ weightToLose = 5, onContinue }: PlateauMotivationProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
      <div className="space-y-8 flex-1 flex flex-col justify-center max-w-sm">
        <h1 className="text-3xl font-bold">MoujApp</h1>
        
        <div className="bg-muted/50 rounded-2xl p-6 space-y-4">
          <p className="text-lg font-semibold">
            Ainda tem <span className="text-primary font-bold">{weightToLose.toFixed(1)} kg</span> pela frente?
          </p>
          <p className="text-sm text-muted-foreground">
            Vamos manter o ritmo juntos para você alcançar seu objetivo
          </p>
        </div>

        <p className="text-sm text-muted-foreground px-4">
          8 em 10 usuários do MoujApp que já estão no GLP-1 quebram o platô em algumas semanas
        </p>
      </div>

      <Button
        onClick={onContinue}
        className="w-full h-14 text-lg rounded-2xl mt-8"
        size="lg"
      >
        Continuar
      </Button>
    </div>
  );
};
