import React from 'react';
import type { ThreatAnalytics } from '../../types/history';
import { ShieldAlert, ShieldCheck, Lock } from 'lucide-react';

interface ThreatAnalyticsBarProps {
  analytics: ThreatAnalytics;
}

export const ThreatAnalyticsBar: React.FC<ThreatAnalyticsBarProps> = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-surface-dark/70 backdrop-blur-2xl border border-glass-border shadow-xl">
      {/* Metric 1: Total Scans Analyzed */}
      <div className="flex items-center justify-between p-5 rounded-xl bg-surface-container/60 hover:bg-surface-container-high/60 transition-colors border border-glass-border/40">
        <div className="flex flex-col">
          <span className="font-mono text-[11px] uppercase tracking-widest text-on-surface-variant">
            Total Scans Analyzed
          </span>
          <span className="font-headline text-3xl sm:text-4xl text-color-offwhite leading-none mt-1.5">
            {analytics.totalScans}
          </span>
          <span className="font-body text-xs text-on-surface-variant/80 mt-1.5">
            {analytics.totalScans === 0
              ? 'Awaiting first threat inspection'
              : `Top category: ${analytics.topCategory}`}
          </span>
        </div>
        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary border border-glass-border">
          <ShieldAlert className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Metric 2: Threats Deflected */}
      <div className="flex items-center justify-between p-5 rounded-xl bg-surface-container/60 hover:bg-surface-container-high/60 transition-colors border border-glass-border/40">
        <div className="flex flex-col">
          <span className="font-mono text-[11px] uppercase tracking-widest text-on-surface-variant">
            Threats Deflected
          </span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="font-headline text-3xl sm:text-4xl text-primary leading-none">
              {analytics.highRiskCount}
            </span>
            <span className="font-mono text-xs text-on-surface-variant">High</span>
            <span className="font-headline text-3xl sm:text-4xl text-risk-medium leading-none ml-2">
              {analytics.mediumRiskCount}
            </span>
            <span className="font-mono text-xs text-on-surface-variant">Med</span>
          </div>
          <span className="font-body text-xs text-risk-low mt-1.5 font-medium">
            {analytics.totalScans > 0
              ? `${analytics.deflectionAccuracy}% Threat Interception`
              : '100% Defense Readiness'}
          </span>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center text-primary border border-color-crimson/40">
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Metric 3: Ephemeral Security Standard */}
      <div className="flex items-center justify-between p-5 rounded-xl bg-surface-container/60 hover:bg-surface-container-high/60 transition-colors border border-glass-border/40">
        <div className="flex flex-col">
          <span className="font-mono text-[11px] uppercase tracking-widest text-on-surface-variant">
            Ephemeral Protocol
          </span>
          <span className="font-headline text-2xl text-risk-low leading-none mt-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-risk-low animate-pulse" />
            ENFORCED
          </span>
          <span className="font-body text-xs text-on-surface-variant/80 mt-2">
            Zero PII Logged • Local Storage Only
          </span>
        </div>
        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant border border-glass-border">
          <Lock className="w-6 h-6 text-on-surface-variant" />
        </div>
      </div>
    </div>
  );
};
