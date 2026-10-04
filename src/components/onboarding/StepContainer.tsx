import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { Button } from '@/components/ui/button';

interface StepContainerProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  showBack?: boolean;
}

export const StepContainer = ({
  children,
  currentStep,
  totalSteps,
  onBack,
  showBack = true,
}: StepContainerProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            {showBack ? (
              <button
                onClick={onBack}
                className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            ) : (
              <div className="w-10" />
            )}
          </div>
          <ProgressBar current={currentStep} total={totalSteps} />
        </div>

        {/* Content */}
        <div className="flex-1 px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
};
