import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { GlassButton } from './GlassButton';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-surface-container-high/80 border border-glass-border flex items-center justify-center mb-5 text-on-surface-variant">
        {icon || <ShieldCheck className="w-8 h-8 text-risk-low" />}
      </div>
      <h3 className="font-headline text-xl text-color-offwhite mb-2">{title}</h3>
      <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <GlassButton variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </GlassButton>
      )}
    </div>
  );
};
