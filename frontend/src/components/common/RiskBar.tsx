import React from 'react';
import type { RiskLevel } from '../../types/api';

interface RiskBarProps {
  score: number;
  label?: string;
  level?: RiskLevel;
  showScore?: boolean;
}

export const RiskBar: React.FC<RiskBarProps> = ({
  score,
  label,
  level,
  showScore = true,
}) => {
  const normalizedScore = Math.min(100, Math.max(0, score));

  // Determine risk level if not explicitly provided
  const resolvedLevel: RiskLevel =
    level ||
    (normalizedScore >= 75 ? 'HIGH' : normalizedScore >= 35 ? 'MEDIUM' : 'LOW');

  const barColor = {
    HIGH: 'bg-color-crimson shadow-[0_0_12px_rgba(139,13,26,0.6)]',
    MEDIUM: 'bg-risk-medium shadow-[0_0_12px_rgba(201,122,43,0.5)]',
    LOW: 'bg-risk-low shadow-[0_0_12px_rgba(58,125,92,0.5)]',
    UNKNOWN: 'bg-on-surface-variant',
  }[resolvedLevel];

  return (
    <div className="w-full space-y-1.5">
      {(label || showScore) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-mono text-on-surface-variant">{label}</span>}
          {showScore && (
            <span className="font-mono font-medium text-color-offwhite">
              {normalizedScore}%
            </span>
          )}
        </div>
      )}
      <div className="h-2 w-full bg-surface-container-highest/60 rounded-full overflow-hidden p-0.5 border border-glass-border">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
    </div>
  );
};
