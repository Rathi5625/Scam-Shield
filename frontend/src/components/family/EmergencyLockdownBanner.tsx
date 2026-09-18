import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface EmergencyLockdownBannerProps {
  activatedAt?: string;
  onDeactivateClick: () => void;
}

export const EmergencyLockdownBanner: React.FC<EmergencyLockdownBannerProps> = ({
  activatedAt,
  onDeactivateClick,
}) => {
  return (
    <div className="w-full mb-6 p-4 rounded-2xl bg-color-crimson/25 border border-color-crimson/60 backdrop-blur-xl shadow-[0_0_35px_rgba(139,13,26,0.35)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
      <div className="flex items-center gap-3 text-left">
        <div className="w-10 h-10 rounded-full bg-color-crimson flex items-center justify-center text-color-offwhite shrink-0 shadow-md">
          <ShieldAlert className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-headline text-sm font-semibold text-color-offwhite">
              EMERGENCY LOCKDOWN ACTIVE
            </span>
            <span className="px-2 py-0.5 rounded-full bg-color-crimson text-color-offwhite font-mono text-[9px] uppercase tracking-wider font-bold">
              LOCAL APP RESTRICTION
            </span>
          </div>
          <p className="font-body text-xs text-on-surface-variant mt-0.5">
            Heightened threat quarantine engaged. Risky external links flagged with elevated priority across this application.
            {activatedAt && ` (Active since ${new Date(activatedAt).toLocaleTimeString()})`}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onDeactivateClick}
        className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-color-offwhite font-mono text-xs border border-glass-border hover:border-color-crimson transition-colors cursor-pointer shrink-0"
      >
        Deactivate Lockdown
      </button>
    </div>
  );
};
