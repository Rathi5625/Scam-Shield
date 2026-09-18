import React from 'react';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  rimHighlight?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  rimHighlight = true,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`rounded-3xl bg-surface-container-low/60 backdrop-blur-2xl border border-glass-border shadow-glass ${
        rimHighlight ? 'glass-rim-highlight' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
