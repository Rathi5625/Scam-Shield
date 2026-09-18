import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-color-crimson/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-7 py-3.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-color-crimson text-color-offwhite shadow-crimson-ambient hover:shadow-crimson-glow hover:bg-[#a21221] border border-color-crimson/40',
    secondary:
      'border backdrop-blur-md transition-colors',
    outline:
      'bg-transparent text-on-surface border border-border-subtle hover:border-glass-border transition-colors',
    ghost:
      'bg-transparent text-on-surface-variant hover:text-color-offwhite transition-colors',
    danger:
      'bg-color-crimson/90 hover:bg-color-crimson text-color-offwhite border border-color-crimson shadow-crimson-glow',
  };

  const variantInlineStyles: React.CSSProperties =
    variant === 'secondary'
      ? {
          backgroundColor: 'var(--btn-secondary-bg)',
          color: 'var(--btn-secondary-text)',
          borderColor: 'var(--btn-secondary-border)',
        }
      : {};

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      style={variantInlineStyles}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
