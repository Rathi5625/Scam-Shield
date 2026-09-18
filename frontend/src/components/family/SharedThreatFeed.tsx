import React, { useState } from 'react';
import { ShieldCheck, Info, CheckCircle2, ArrowUpRight } from 'lucide-react';
import type { ThreatShare } from '../../types/family';

interface SharedThreatFeedProps {
  threats: ThreatShare[];
  onInspectPayload?: (threat: ThreatShare) => void;
}

export const SharedThreatFeed: React.FC<SharedThreatFeedProps> = ({ threats, onInspectPayload }) => {
  const [filter, setFilter] = useState<'ALL' | 'ALERTS_ONLY'>('ALL');

  const filteredThreats = threats.filter((t) => {
    if (filter === 'ALERTS_ONLY') {
      return t.riskLevel === 'HIGH' || t.riskLevel === 'MEDIUM';
    }
    return true;
  });

  const getEventDotColor = (level: string) => {
    if (level === 'HIGH') return 'bg-color-crimson ring-color-black';
    if (level === 'MEDIUM') return 'bg-risk-medium ring-color-black';
    return 'bg-risk-low ring-color-black';
  };

  const getRiskBadge = (threat: ThreatShare) => {
    if (threat.riskLevel === 'HIGH') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-color-crimson text-color-offwhite font-mono text-[10px] font-semibold tracking-wider uppercase">
          HIGH RISK • {threat.riskScore}
        </span>
      );
    }
    if (threat.riskLevel === 'MEDIUM') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-risk-medium text-color-offwhite font-mono text-[10px] font-semibold tracking-wider uppercase">
          MEDIUM RISK • {threat.riskScore}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full bg-risk-low text-color-offwhite font-mono text-[10px] font-semibold tracking-wider uppercase">
        LOW RISK • {threat.riskScore}
      </span>
    );
  };

  const getRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000));
      if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="flex flex-col text-left">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block">
            CHRONOLOGICAL AUDIT
          </span>
          <h2 className="font-headline text-2xl text-color-offwhite tracking-tight">
            Shared Threat Feed
          </h2>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-full bg-surface-container-lowest/80 border border-glass-border">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1 rounded-full font-mono text-xs transition-all cursor-pointer ${
              filter === 'ALL'
                ? 'bg-surface-container-high text-color-offwhite font-medium shadow-sm'
                : 'text-on-surface-variant hover:text-color-offwhite'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('ALERTS_ONLY')}
            className={`px-3.5 py-1 rounded-full font-mono text-xs transition-all cursor-pointer ${
              filter === 'ALERTS_ONLY'
                ? 'bg-color-crimson text-color-offwhite font-medium shadow-sm'
                : 'text-on-surface-variant hover:text-color-offwhite'
            }`}
          >
            Alerts Only
          </button>
        </div>
      </div>

      {filteredThreats.length === 0 ? (
        <div className="p-8 rounded-2xl bg-surface-container-low/70 border border-glass-border text-center space-y-3">
          <ShieldCheck className="w-8 h-8 text-risk-low mx-auto" />
          <h3 className="font-headline text-base text-color-offwhite">No shared threats flagged</h3>
          <p className="font-body text-xs text-on-surface-variant max-w-sm mx-auto">
            Your family defense circle has no pending or unacknowledged security warnings.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4">
          {/* Milestone connector line */}
          <div className="absolute top-3 bottom-3 left-2.5 w-0.5 bg-surface-container-highest" />

          {filteredThreats.map((threat) => (
            <div key={threat.id} className="relative group">
              {/* Colored Milestone Node */}
              <div
                className={`absolute -left-[27px] top-4 w-4 h-4 rounded-full ring-4 ${getEventDotColor(
                  threat.riskLevel
                )}`}
              />

              <div className="p-5 sm:p-6 rounded-2xl bg-surface-container-low/80 hover:bg-surface-container transition-all shadow-md border border-glass-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-headline text-sm font-semibold text-color-offwhite">
                      {threat.sharedBy}
                    </span>
                    {getRiskBadge(threat)}
                  </div>
                  <span className="font-mono text-[11px] text-on-surface-variant">
                    {getRelativeTime(threat.createdAt)}
                  </span>
                </div>

                <p className="font-body text-sm text-color-offwhite mt-2 font-medium">
                  {threat.category.replace(/_/g, ' ')} detected and analyzed.
                </p>

                <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {threat.summary}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[11px] text-on-surface-variant pt-2 border-t border-glass-border/40">
                  {threat.exposureStatus === 'Zero Exposure' && (
                    <span className="flex items-center gap-1 text-risk-low font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Zero Exposure</span>
                    </span>
                  )}
                  {threat.exposureStatus === 'Warned User' && (
                    <span className="flex items-center gap-1 text-risk-medium font-medium">
                      <Info className="w-3.5 h-3.5" />
                      <span>Warned User</span>
                    </span>
                  )}
                  {threat.exposureStatus === 'Verified Authentic' && (
                    <span className="flex items-center gap-1 text-risk-low font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Authentic</span>
                    </span>
                  )}

                  {threat.vector && <span>Vector: {threat.vector}</span>}

                  <button
                    type="button"
                    onClick={() => onInspectPayload && onInspectPayload(threat)}
                    className="text-primary hover:text-color-offwhite ml-auto flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
