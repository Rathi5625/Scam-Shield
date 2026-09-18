import React from 'react';
import type { FamilyAnalytics } from '../../types/family';

interface ProtectionMetricsCardProps {
  analytics: FamilyAnalytics;
}

export const ProtectionMetricsCard: React.FC<ProtectionMetricsCardProps> = ({ analytics }) => {
  return (
    <div className="p-6 rounded-2xl bg-surface-container-low/90 backdrop-blur-xl shadow-xl flex flex-col border border-glass-border text-left">
      <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block">
        30-DAY METRICS
      </span>
      <h3 className="font-headline text-xl text-color-offwhite mt-1">
        Protection Summary
      </h3>

      {/* Mini Donut / Progress Visual matching Stitch screen */}
      <div className="my-5 flex items-center justify-around gap-4">
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {/* Background Circle */}
            <path
              className="text-surface-container-high"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            {/* Safe Segment (Green) */}
            <path
              className="text-risk-low"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray="72, 100"
              strokeLinecap="round"
              strokeWidth="3.5"
            />
            {/* Threat Intercepts (Crimson) */}
            <path
              className="text-color-crimson"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray="16, 100"
              strokeDashoffset="-72"
              strokeLinecap="round"
              strokeWidth="3.5"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="font-headline text-2xl text-color-offwhite font-bold leading-none">
              {analytics.deflectionRate}%
            </span>
            <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-wider mt-0.5">
              Deflected
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-risk-low" />
            <span className="text-on-surface">38 Verified Clean</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-color-crimson" />
            <span className="text-on-surface">{Math.max(7, analytics.highRiskThreats)} Intercepted Scams</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-risk-medium" />
            <span className="text-on-surface">{Math.max(2, analytics.mediumRiskThreats)} User Warnings</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-surface-container-high/50 border border-glass-border">
          <span className="text-on-surface-variant">Estimated Savings Defended</span>
          <span className="font-mono text-xs text-color-offwhite font-semibold">
            ${analytics.estimatedSavings.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-surface-container-high/50 border border-glass-border">
          <span className="text-on-surface-variant">Automated Link Pre-Scans</span>
          <span className="font-mono text-xs text-color-offwhite font-semibold">
            {analytics.linkChecksCount} checks
          </span>
        </div>
      </div>
    </div>
  );
};
