import React from 'react';

interface GlassToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const GlassToggle: React.FC<GlassToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-sm font-medium text-color-offwhite">{label}</span>}
          {description && (
            <span className="text-xs text-on-surface-variant leading-relaxed">{description}</span>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out focus:outline-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{
          backgroundColor: checked ? 'var(--crimson)' : 'var(--border-strong)',
          borderColor: checked ? 'var(--crimson-border)' : 'var(--border-default)',
          boxShadow: checked ? '0 0 14px rgba(139,13,26,0.40)' : 'none',
        }}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-md transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
          style={{ backgroundColor: '#F5F2ED' }}
        />
      </button>
    </div>
  );
};
