import { Button } from '@/components/ui/button';
import { Star, Check } from 'lucide-react';

interface SuccessStoriesProps {
  onContinue: () => void;
}

export const SuccessStories = ({ onContinue }: SuccessStoriesProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
      <div className="space-y-8 flex-1 flex flex-col justify-center">
        <h2 className="text-2xl font-bold">
          Histórias de Sucesso
        </h2>

        {/* 5 Stars */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-10 h-10 fill-yellow-400 text-yellow-400" />
          ))}
        </div>

        <p className="text-muted-foreground">
          Veja o que nossos usuários alcançaram
        </p>

        {/* Avatar Stack */}
        <div className="flex justify-center -space-x-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background" />
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary border-2 border-background" />
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent border-2 border-background" />
        </div>

        <p className="font-semibold">
          +2K de usuários já emagreceram com o MoujApp
        </p>

        {/* Check Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
            <Check className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-bold text-lg">
            Você está pronto para transformar sua vida!
          </p>
          <p className="text-sm text-muted-foreground px-8">
            Junte-se a milhares de usuários que já emagreceram e alcançaram seus objetivos
          </p>
        </div>
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
