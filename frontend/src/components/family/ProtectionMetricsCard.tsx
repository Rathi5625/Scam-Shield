import React from 'react';
import type { FamilyAnalytics } from '../../types/family';

interface ProtectionMetricsCardProps {
  analytics: FamilyAnalytics;
}

export const ProtectionMetricsCard: React.FC<ProtectionMetricsCardProps> = ({ analytics }) => {
  const hasThreats = analytics.totalSharedThreats > 0;

  return (
    <div className="p-6 rounded-2xl bg-surface-container-low/90 backdrop-blur-xl shadow-xl flex flex-col border border-glass-border text-left">
      <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block">
        GROUP DEFENSE METRICS
      </span>
      <h3 className="font-headline text-xl text-color-offwhite mt-1">
        Protection Summary
      </h3>

      {!hasThreats ? (
        <div className="my-5 p-5 rounded-xl bg-surface-container-high/40 border border-glass-border text-center space-y-2.5">
          <p className="font-body text-xs text-on-surface-variant leading-relaxed">
            No shared threats logged yet. When family members share suspicious messages, screenshots, or links, deflection analytics and incident breakdown will compute in real time.
          </p>
          <div className="pt-2 font-mono text-[11px] text-color-offwhite">
            Active Guardians: <strong className="text-primary">{analytics.activeMembers || 1}</strong>
          </div>
        </div>
      ) : (
        <>
          <div className="my-5 flex items-center justify-around gap-4">
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-container-high"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-color-crimson"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${Math.min(100, Math.max(0, analytics.deflectionRate))}, 100`}
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
                <span className="w-2.5 h-2.5 rounded-full bg-color-crimson" />
                <span className="text-on-surface">{analytics.highRiskThreats} High Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-risk-medium" />
                <span className="text-on-surface">{analytics.mediumRiskThreats} Warnings</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-risk-low" />
                <span className="text-on-surface">{analytics.lowRiskThreats} Neutral / Low</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-surface-container-high/50 border border-glass-border">
              <span className="text-on-surface-variant">Shared Threat Incidents</span>
              <span className="font-mono text-xs text-color-offwhite font-semibold">
                {analytics.totalSharedThreats}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-surface-container-high/50 border border-glass-border">
              <span className="text-on-surface-variant">Flagged Link Inspections</span>
              <span className="font-mono text-xs text-color-offwhite font-semibold">
                {analytics.linkChecksCount}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
