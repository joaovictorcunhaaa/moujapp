import { Button } from '@/components/ui/button';

interface WelcomeProps {
  onContinue: () => void;
}

export const Welcome = ({ onContinue }: WelcomeProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 p-6">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <img src="/moujapp.png" alt="Logo MoujApp" className="w-86 h-86 object-contain" />
        </div>

        {/* Welcome Text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Bem-vindo ao MoujApp</h1>
          <p className="text-muted-foreground text-lg">
            Seu companheiro inteligente para acompanhamento GLP-1
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full space-y-4 p-6">
        <Button
          onClick={onContinue}
          className="w-full h-14 text-lg rounded-2xl"
          size="lg"
        >
          Começar
        </Button>
      </div>
    </div>
  );
};
