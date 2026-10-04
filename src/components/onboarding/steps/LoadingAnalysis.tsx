import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface LoadingAnalysisProps {
  onComplete: () => void;
}

const steps = [
  'Analisando perfil de saúde',
  'Calculando métricas personalizadas',
  'Definindo objetivos',
  'Preparando seu plano',
];

export const LoadingAnalysis = ({ onComplete }: LoadingAnalysisProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const totalDuration = 4000; // 4 seconds
    const interval = 50;
    const increment = (100 / totalDuration) * interval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const stepProgress = Math.floor((progress / 100) * steps.length);
    setCurrentStep(Math.min(stepProgress, steps.length - 1));
  }, [progress]);

  return (
    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
      <div className="space-y-12 flex-1 flex flex-col justify-center">
        {/* Circular Progress */}
        <div className="relative w-40 h-40 mx-auto">
          <svg className="transform -rotate-90 w-40 h-40">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-border"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`}
              className="text-foreground transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold">{Math.round(progress)}%</span>
          </div>
        </div>

        <h2 className="text-xl font-semibold">
          Analisando seu perfil
        </h2>

        {/* Steps Checklist */}
        <div className="space-y-4 text-left max-w-xs mx-auto">
          {steps.map((step, index) => {
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div
                key={step}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isComplete ? 'text-accent' : isCurrent ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isComplete
                      ? 'bg-accent border-accent'
                      : isCurrent
                      ? 'border-foreground'
                      : 'border-muted-foreground/30'
                  }`}
                >
                  {isComplete && <Check className="w-4 h-4 text-white" />}
                </div>
                <span className="text-sm font-medium">{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
