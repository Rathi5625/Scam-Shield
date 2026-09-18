import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle } from 'lucide-react';
import { GlassButton } from '../common/GlassButton';

interface EmergencyLockdownModalProps {
  isOpen: boolean;
  isActive: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const EmergencyLockdownModal: React.FC<EmergencyLockdownModalProps> = ({
  isOpen,
  isActive,
  onClose,
  onConfirm,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAction = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-color-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-surface-container-low border border-color-crimson/50 p-6 sm:p-8 shadow-2xl text-left overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-color-crimson to-transparent" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-on-surface-variant hover:text-color-offwhite hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-color-crimson/20 border border-color-crimson/40 w-fit mb-4">
          <ShieldAlert className="w-4 h-4 text-color-crimson" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-crimson-light font-bold">
            LOCAL APP PROTECTION MODE
          </span>
        </div>

        <h3 className="font-headline text-2xl text-color-offwhite">
          {isActive ? 'Deactivate Emergency Lockdown?' : 'Activate Emergency Lockdown?'}
        </h3>

        <p className="font-body text-sm text-on-surface-variant mt-2 leading-relaxed">
          {isActive
            ? 'ScamShield will return to standard nominal heuristic scanning for this family defense perimeter.'
            : 'ScamShield will enter a heightened threat interception state across this application. All scans will enforce aggressive link quarantine warnings and priority family broadcast alerts.'}
        </p>

        <div className="mt-5 p-3.5 rounded-xl bg-surface-container-lowest border border-glass-border flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-risk-medium shrink-0 mt-0.5" />
          <p className="font-mono text-[11px] text-on-surface-variant leading-relaxed">
            <strong>Scope Disclosure:</strong> This protocol is an application-level guard. It heightens warnings within ScamShield but does not alter your operating system, browser network stack, or device hardware.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono text-on-surface-variant hover:text-color-offwhite cursor-pointer"
          >
            Cancel
          </button>

          <GlassButton
            variant="primary"
            size="md"
            onClick={handleAction}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Processing...'
              : isActive
              ? 'Deactivate Lockdown'
              : 'Activate Lockdown'}
          </GlassButton>
        </div>
      </div>
    </div>
  );
};
