import React from 'react';

interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
}

export const GlassTextarea: React.FC<GlassTextareaProps> = ({
  label,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-mono uppercase tracking-wider text-on-surface-variant font-medium">
          {label}
        </label>
      )}
      <textarea
        rows={5}
        className={`w-full rounded-2xl ss-input p-4 text-sm focus:outline-none transition-all font-body resize-y ${className}`}
        {...props}
      />
      {helperText && (
        <span className="text-[11px] text-on-surface-variant/70 font-mono">
          {helperText}
        </span>
      )}
    </div>
  );
};
