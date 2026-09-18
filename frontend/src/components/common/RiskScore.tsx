import React from 'react';
import type { RiskLevel } from '../../types/api';
import { RiskBadge } from './RiskBadge';

interface RiskScoreProps {
  score: number;
  level: RiskLevel;
  subtitle?: string;
}

export const RiskScore: React.FC<RiskScoreProps> = ({
  score,
  level,
  subtitle = 'Immediate Threat Vectors Detected',
}) => {
  // 240px SVG circle radius = 104 -> circumference = 2 * PI * 104 ≈ 653.45
  const radius = 104;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const colorConfig = {
    HIGH: {
      stroke: '#8B0D1A',
      shadow: 'rgba(139, 13, 26, 0.45)',
      glowClass: 'bg-color-crimson/20',
    },
    MEDIUM: {
      stroke: '#C97A2B',
      shadow: 'rgba(201, 122, 43, 0.45)',
      glowClass: 'bg-risk-medium/20',
    },
    LOW: {
      stroke: '#3A7D5C',
      shadow: 'rgba(58, 125, 92, 0.45)',
      glowClass: 'bg-risk-low/20',
    },
    UNKNOWN: {
      stroke: '#59413f',
      shadow: 'rgba(89, 65, 63, 0.25)',
      glowClass: 'bg-surface-container-high/40',
    },
  }[level];

  return (
    <div className="relative flex flex-col items-center justify-center pt-2">
      {/* Ambient background glow behind dial */}
      <div
        className={`absolute -inset-8 ${colorConfig.glowClass} rounded-full blur-[90px] pointer-events-none`}
      />

      <div className="relative w-64 h-64 rounded-full bg-surface-container-low/80 backdrop-blur-2xl border border-glass-border shadow-glass flex flex-col items-center justify-center p-6 transition-all duration-500 hover:shadow-crimson-ambient">
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 240 240">
          <circle
            className="text-surface-container-highest/40"
            cx="120"
            cy="120"
            fill="none"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
          />
          <circle
            cx="120"
            cy="120"
            fill="none"
            r={radius}
            stroke={colorConfig.stroke}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${colorConfig.shadow})`,
              transition: 'stroke-dashoffset 0.8s ease-out',
            }}
          />
        </svg>

        <div className="flex flex-col items-center gap-1.5 z-10 text-center">
          <RiskBadge level={level} size="sm" />
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-headline text-5xl font-bold text-color-offwhite tracking-tight">
              {score}
            </span>
            <span className="font-body text-sm text-on-surface-variant">/ 100</span>
          </div>
          {subtitle && (
            <span className="font-mono text-[11px] text-on-surface-variant max-w-[140px] leading-tight mt-1">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
