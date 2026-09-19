import React, { useState } from 'react';
import { X, Lock, AlertTriangle, Users } from 'lucide-react';
import { GlassButton } from '../common/GlassButton';

export interface ThreatPreviewData {
  sharedBy: string;
  scanType: 'TEXT' | 'LINK' | 'SCREENSHOT';
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  riskScore?: number;
  category: string;
  summary: string;
  targetDomain?: string;
}

interface ShareThreatModalProps {
  isOpen: boolean;
  threat: ThreatPreviewData;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const ShareThreatModal: React.FC<ShareThreatModalProps> = ({
  isOpen,
  threat,
  onClose,
  onConfirm,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAction = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onConfirm();
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to broadcast threat alert.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isHighRisk = threat.riskLevel === 'HIGH';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-color-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-surface-container-low border border-glass-border p-6 sm:p-8 shadow-2xl text-left overflow-hidden">
        {/* Top Hairline Indicator */}
        <div
          className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${
            isHighRisk
              ? 'from-transparent via-color-crimson to-transparent'
              : 'from-transparent via-risk-low to-transparent'
          }`}
        />

        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-1.5 rounded-full text-on-surface-variant hover:text-color-offwhite hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-glass-border w-fit mb-4">
          <Users className="w-4 h-4 text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
            FAMILY DEFENSE BROADCAST
          </span>
        </div>

        <h3 className="font-headline text-2xl text-color-offwhite">
          Broadcast Threat to Family Shield
        </h3>

        <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
          Alert your family members so they stay vigilant against similar deception attempts.
        </p>

        {/* Sanitized Threat Preview Card */}
        <div className="mt-4 p-4 rounded-2xl bg-surface-container-lowest/80 border border-glass-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase text-on-surface-variant font-semibold">
              SANITIZED THREAT PREVIEW
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${
                isHighRisk
                  ? 'bg-color-crimson/20 text-primary border border-color-crimson/50'
                  : 'bg-risk-medium/20 text-risk-medium border border-risk-medium/50'
              }`}
            >
              {threat.riskLevel} RISK • {threat.riskScore ?? 80}/100
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-on-surface-variant">Category:</span>
              <span className="text-color-offwhite font-semibold">
                {threat.category.replace(/_/g, ' ')}
              </span>
            </div>

            {threat.targetDomain && (
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-on-surface-variant">Flagged Target:</span>
                <span className="text-primary font-mono truncate max-w-xs">{threat.targetDomain}</span>
              </div>
            )}

            <div className="pt-1 text-xs font-body text-on-surface-variant leading-relaxed">
              <span className="text-color-offwhite font-medium">Summary: </span>
              {threat.summary}
            </div>
          </div>
        </div>

        {/* Privacy & Safety Guarantee Disclosure */}
        <div className="mt-4 p-3.5 rounded-xl bg-surface-container-high/40 border border-glass-border/40 flex items-start gap-3">
          <Lock className="w-4 h-4 text-risk-low shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-left">
            <h5 className="font-headline text-xs text-color-offwhite font-medium">
              Zero Private Data Transmitted
            </h5>
            <p className="font-body text-[11px] text-on-surface-variant leading-relaxed">
              Passwords, OTPs, bank account numbers, personal recipient names, and raw conversational transcripts are
              strictly excluded and never broadcast to family devices.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-color-crimson/20 border border-color-crimson/50 text-primary font-mono text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-glass-border/50">
          <GlassButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </GlassButton>

          <GlassButton
            type="button"
            variant="primary"
            size="md"
            onClick={handleAction}
            disabled={isSubmitting}
            icon={<Users className="w-4 h-4" />}
          >
            {isSubmitting ? 'Broadcasting Alert...' : 'Confirm & Broadcast Alert'}
          </GlassButton>
        </div>
      </div>
    </div>
  );
};

export default ShareThreatModal;
