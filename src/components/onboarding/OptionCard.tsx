import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface OptionCardProps {
  children: ReactNode;
  selected?: boolean;
  onClick: () => void;
  icon?: ReactNode;
  className?: string;
}

export const OptionCard = ({
  children,
  selected = false,
  onClick,
  icon,
  className,
}: OptionCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-2xl text-left transition-all duration-200',
        'border-2 font-medium',
        selected
          ? 'bg-foreground text-background border-foreground'
          : 'bg-muted text-foreground border-transparent hover:border-border',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-xl">{icon}</span>}
        <span>{children}</span>
      </div>
    </button>
  );
};
