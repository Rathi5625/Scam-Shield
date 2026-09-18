import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, BellRing, Link2Off } from 'lucide-react';
import type { ThreatShare } from '../../types/family';

interface CriticalIncidentBannerProps {
  topIncident?: ThreatShare | null;
  onViewAnalysis?: (incident: ThreatShare) => void;
  onSendReminder?: (incident: ThreatShare) => void;
}

export const CriticalIncidentBanner: React.FC<CriticalIncidentBannerProps> = ({
  topIncident,
  onViewAnalysis,
  onSendReminder,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

  if (isDismissed || !topIncident) {
    return null;
  }

  const handleSendReminder = () => {
    setReminderSent(true);
    if (onSendReminder) onSendReminder(topIncident);
  };

  return (
    <section className="relative z-10 w-full mt-4 animate-fadeIn" id="priority-incident">
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-low/90 backdrop-blur-2xl p-6 md:p-8 shadow-2xl border border-color-crimson/40">
        {/* Ambient Crimson Backing Flare */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-color-crimson/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Alert Text Details */}
          <div className="flex items-start gap-4 max-w-3xl text-left">
            <div className="w-12 h-12 rounded-full bg-color-crimson/30 flex items-center justify-center text-primary shrink-0 shadow-lg shadow-color-crimson/20 border border-color-crimson/50">
              <AlertTriangle className="w-6 h-6 text-color-crimson" />
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-color-crimson text-color-offwhite font-mono text-[10px] font-semibold tracking-wider uppercase">
                  {topIncident.riskLevel} RISK • {topIncident.riskScore}/100
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono text-[10px]">
                  {topIncident.category.replace(/_/g, ' ')}
                </span>
                <span className="flex items-center gap-1.5 text-crimson-light font-mono text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-color-crimson animate-pulse" />
                  Action Advised
                </span>
              </div>

              <h2 className="font-headline text-xl sm:text-2xl text-color-offwhite tracking-tight">
                {topIncident.sharedBy} received a high-risk deceptive alert.
              </h2>

              <p className="font-body text-sm text-on-surface-variant mt-1 max-w-2xl leading-relaxed">
                {topIncident.summary}
              </p>

              {topIncident.targetDomain && (
                <div className="mt-3 inline-flex items-center gap-2 text-on-surface-variant font-mono text-xs">
                  <Link2Off className="w-4 h-4 text-color-crimson shrink-0" />
                  <span className="text-on-surface">
                    Target domain:{' '}
                    <span className="text-crimson-light font-semibold underline decoration-primary/50">
                      {topIncident.targetDomain}
                    </span>{' '}
                    (Null DKIM / Newly Registered 48h)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Module */}
          <div className="flex flex-col sm:flex-row lg:flex-col shrink-0 gap-2.5 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => onViewAnalysis && onViewAnalysis(topIncident)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-color-crimson hover:brightness-110 text-color-offwhite font-headline text-sm transition-all shadow-[0_12px_28px_-6px_rgba(139,13,26,0.55)] cursor-pointer"
            >
              <span>View Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleSendReminder}
              disabled={reminderSent}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-body text-xs transition-all border border-glass-border cursor-pointer ${
                reminderSent
                  ? 'bg-risk-low/20 text-risk-low border-risk-low/40'
                  : 'bg-surface-container-high hover:bg-surface-variant text-color-offwhite'
              }`}
            >
              <BellRing className="w-4 h-4 text-tertiary" />
              <span>{reminderSent ? 'Safety Reminder Sent (Mock)' : 'Send Safety Reminder'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="w-full text-center py-1 font-mono text-[11px] text-on-surface-variant hover:text-color-offwhite transition-colors cursor-pointer"
            >
              Dismiss incident
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
