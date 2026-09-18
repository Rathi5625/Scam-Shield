import React from 'react';
import type { RiskLevel } from '../../types/api';
import { ShieldCheck, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface MitigationChecklistProps {
  primaryAction: string;
  riskLevel: RiskLevel;
  categoryName?: string;
}

export const MitigationChecklist: React.FC<MitigationChecklistProps> = ({
  primaryAction,
  riskLevel,
}) => {
  // Step-by-step guidance tailored to the risk tier while anchoring to the authoritative primaryAction
  const steps = (() => {
    if (riskLevel === 'HIGH') {
      return [
        {
          num: 1,
          title: 'Verify independently',
          detail: 'Never trust sender contact information in the message. Access the official application or verified website directly.',
        },
        {
          num: 2,
          title: 'Safeguard credentials',
          detail: 'Legitimate institutions, banks, and government agencies will never demand your PIN, password, or One-Time Passcode via SMS or chat.',
        },
        {
          num: 3,
          title: 'Block & report sender',
          detail: 'Add the originating phone number or email address to your device blacklist and report the message as spam/phishing.',
        },
      ];
    }
    if (riskLevel === 'MEDIUM') {
      return [
        {
          num: 1,
          title: 'Pause before complying',
          detail: 'Review the message for unsolicited employment, delivery fees, or urgent prize collection prompts.',
        },
        {
          num: 2,
          title: 'Inspect communication channel',
          detail: 'Legitimate recruiters and courier services do not conduct official business via disposable Telegram channels or personal UPI handles.',
        },
      ];
    }
    if (riskLevel === 'LOW') {
      return [
        {
          num: 1,
          title: 'Maintain digital vigilance',
          detail: 'While no threat vectors were detected in this snippet, always remain mindful of unexpected requests for personal information.',
        },
      ];
    }
    return [
      {
        num: 1,
        title: 'Exercise caution',
        detail: 'The message content could not be conclusively validated. Avoid sharing credentials or transferring funds until verified.',
      },
    ];
  })();

  return (
    <div className="relative p-6 sm:p-8 rounded-2xl bg-surface-container-low/70 backdrop-blur-xl border border-glass-border shadow-glass flex flex-col justify-between space-y-6">
      <div className="space-y-6">
        {/* Primary Directive Banner */}
        <div
          className={`p-4 rounded-xl flex items-start sm:items-center gap-3.5 border ${
            riskLevel === 'HIGH'
              ? 'bg-color-crimson/20 border-color-crimson/50 text-color-offwhite'
              : riskLevel === 'MEDIUM'
              ? 'bg-risk-medium/20 border-risk-medium/50 text-color-offwhite'
              : 'bg-surface-container-high/60 border-glass-border text-color-offwhite'
          }`}
        >
          <div className="shrink-0 mt-0.5 sm:mt-0">
            {riskLevel === 'HIGH' ? (
              <AlertOctagon className="w-6 h-6 text-color-crimson" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-primary" />
            )}
          </div>
          <div>
            <span
              className={`font-mono text-[10px] uppercase font-bold tracking-wider block ${
                riskLevel === 'HIGH' ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              PRIMARY DIRECTIVE
            </span>
            <p className="font-headline text-base sm:text-lg font-medium text-color-offwhite mt-0.5 leading-snug">
              {primaryAction}
            </p>
          </div>
        </div>

        {/* Tactical Guidance Steps */}
        <ul className="space-y-4 font-body text-sm text-on-surface">
          {steps.map((step) => (
            <li key={step.num} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-surface-container-high border border-glass-border flex items-center justify-center font-mono text-xs font-semibold text-color-offwhite shrink-0 mt-0.5">
                {step.num}
              </span>
              <div className="space-y-0.5">
                <strong className="text-color-offwhite font-medium block">
                  {step.title}
                </strong>
                <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed">
                  {step.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer Protection Status */}
      <div className="pt-3 border-t border-glass-border/40 flex items-center justify-between text-on-surface-variant font-mono text-xs">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-risk-low" />
          Zero Breach Recorded
        </span>
        <span className="text-color-offwhite">Protocol Status: Active</span>
      </div>
    </div>
  );
};
