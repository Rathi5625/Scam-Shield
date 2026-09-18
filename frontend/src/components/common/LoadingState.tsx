import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Analyzing threat indicators...',
  subMessage = 'Deconstructing linguistics, intent, urgency, and destination vectors',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative flex items-center justify-center w-24 h-24 mb-6">
        {/* Radar ping rings */}
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-color-crimson/20 opacity-75" />
        <span className="absolute inline-flex h-20 w-20 rounded-full bg-color-crimson/10 border border-color-crimson/30" />
        <div className="relative w-14 h-14 rounded-full bg-surface-dark border border-color-crimson/60 flex items-center justify-center shadow-crimson-glow">
          <ShieldAlert className="w-7 h-7 text-color-crimson animate-pulse" />
        </div>
      </div>

      <h3 className="font-headline text-xl text-color-offwhite tracking-tight mb-2">
        {message}
      </h3>
      <p className="font-body text-sm text-on-surface-variant max-w-md leading-relaxed">
        {subMessage}
      </p>

      {/* Subtle telemetry progress ticker */}
      <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest/60 border border-glass-border">
        <span className="w-2 h-2 rounded-full bg-color-crimson animate-ping" />
        <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider">
          NEURAL PIPELINE ACTIVE
        </span>
      </div>
    </div>
  );
};
