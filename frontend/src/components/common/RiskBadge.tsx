import React from 'react';
import type { RiskLevel } from '../../types/api';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showDot = true,
}) => {
  const config = {
    HIGH: {
      label: 'HIGH RISK',
      bg: 'bg-color-crimson/20 border-color-crimson/60 text-primary',
      dotColor: 'bg-risk-high',
      ping: true,
    },
    MEDIUM: {
      label: 'MEDIUM RISK',
      bg: 'bg-risk-medium/20 border-risk-medium/50 text-risk-medium',
      dotColor: 'bg-risk-medium',
      ping: false,
    },
    LOW: {
      label: 'LOW RISK',
      bg: 'bg-risk-low/20 border-risk-low/50 text-emerald-700 dark:text-[#86efac]',
      dotColor: 'bg-risk-low',
      ping: false,
    },
    UNKNOWN: {
      label: 'INCONCLUSIVE',
      bg: 'bg-surface-container-high border-border-subtle text-on-surface-variant',
      dotColor: 'bg-on-surface-variant',
      ping: false,
    },
  }[level];

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-2',
    lg: 'text-sm px-4 py-1.5 gap-2.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-mono font-semibold tracking-wider uppercase backdrop-blur-md ${config.bg} ${sizeStyles[size]}`}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          {config.ping && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotColor}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
        </span>
      )}
      {config.label}
    </span>
  );
};
