import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { GlassButton } from './GlassButton';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Analysis Failed',
  message = 'An error occurred while evaluating the threat payload. Please verify your connection and try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-full bg-color-crimson/15 border border-color-crimson/40 flex items-center justify-center mb-4 text-color-crimson">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="font-headline text-xl text-color-offwhite mb-2">{title}</h3>
      <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-6">
        {message}
      </p>
      {onRetry && (
        <GlassButton
          variant="secondary"
          size="sm"
          onClick={onRetry}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Retry Inspection
        </GlassButton>
      )}
    </div>
  );
};
