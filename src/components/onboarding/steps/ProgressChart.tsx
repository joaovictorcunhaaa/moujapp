import { Button } from '@/components/ui/button';

interface ProgressChartProps {
  onContinue: () => void;
}

export const ProgressChart = ({ onContinue }: ProgressChartProps) => {
  return (
    <div className="flex flex-col h-full py-8">
      <div className="space-y-8 flex-1">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">
            Seu Potencial de Sucesso com MoujApp
          </h2>
          <p className="text-sm text-muted-foreground">
            Dados de estudos clínicos mostram que usuários com acompanhamento estruturado alcançam melhores resultados
          </p>
        </div>

        {/* Chart */}
        <div className="relative h-64 bg-muted/30 rounded-2xl p-6">
          <div className="relative h-full flex items-end">
            {/* Y-axis label */}
            <div className="absolute left-0 top-0 text-xs text-muted-foreground -rotate-90 origin-left transform translate-x-[-50%] translate-y-12">
              Perda de peso
            </div>

            {/* Chart area */}
            <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="50" x2="300" y2="50" stroke="currentColor" strokeWidth="1" className="text-border" opacity="0.3" />
              <line x1="0" y1="100" x2="300" y2="100" stroke="currentColor" strokeWidth="1" className="text-border" opacity="0.3" />
              <line x1="0" y1="150" x2="300" y2="150" stroke="currentColor" strokeWidth="1" className="text-border" opacity="0.3" />
              
              {/* Without MoujApp line (gray) */}
              <path
                d="M 0 40 Q 75 60, 150 80 T 300 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted-foreground"
                opacity="0.4"
              />
              
              {/* With MoujApp line (green) */}
              <path
                d="M 0 20 Q 75 80, 150 120 T 300 160"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-accent"
              />
              
              {/* End point */}
              <circle cx="300" cy="160" r="6" fill="currentColor" className="text-accent" />
            </svg>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-2">
              <span>Início</span>
              <span>3 meses</span>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute top-4 right-4 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-accent rounded-full" />
              <span className="font-medium">Com MoujApp</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-muted-foreground/40 rounded-full" />
              <span className="text-muted-foreground">Sem MoujApp</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Dados baseados em estudos clínicos de eficácia de medicamentos GLP-1 com acompanhamento estruturado
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
