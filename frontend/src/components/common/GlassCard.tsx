import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'alert';
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  interactive = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl relative overflow-hidden transition-all duration-300';

  const variantStyles = {
    default: 'liquid-glass-card glass-rim-highlight p-6',
    elevated:
      'bg-surface-container-low/80 backdrop-blur-2xl border border-glass-border shadow-glass glass-rim-highlight p-6 sm:p-8',
    alert:
      'bg-surface-container-low/80 backdrop-blur-2xl border border-color-crimson/30 shadow-crimson-ambient p-6',
  };

  const hoverStyles = interactive
    ? 'hover:-translate-y-0.5 hover:border-glass-border/80 cursor-pointer'
    : '';

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};
