import React from 'react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  monospace?: boolean;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  icon,
  monospace = false,
  className = '',
  ...props
}) => {
  return (
    <div className="relative flex items-center w-full">
      {icon && (
        <div className="absolute left-4 pointer-events-none text-on-surface-variant flex items-center">
          {icon}
        </div>
      )}
      <input
        className={`w-full rounded-xl ss-input px-4 py-3 text-sm focus:outline-none transition-all ${
          icon ? 'pl-11' : ''
        } ${monospace ? 'font-mono' : 'font-body'} ${className}`}
        {...props}
      />
    </div>
  );
};
