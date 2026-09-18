import React, { useState } from 'react';
import {
  Key,
  Usb,
  Smartphone,
  Laptop,
  CheckCircle2,
} from 'lucide-react';

export const SecurityAuthSection: React.FC = () => {
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [mobileSessionRevoked, setMobileSessionRevoked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleConfigureKey = () => {
    setFeedback('YubiKey 5C WebAuthn challenge verified locally.');
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleRegenerateTotp = () => {
    setFeedback('TOTP rotating secret seed regenerated.');
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleRevokeSession = () => {
    setMobileSessionRevoked(true);
    setFeedback('Remote mobile session token revoked.');
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <section
      id="security-section"
      className="relative rounded-3xl bg-surface-dark p-6 sm:p-8 md:p-10 shadow-[0_12px_36px_-8px_rgba(0,0,0,0.6),inset_0_1px_1px_0_rgba(245,242,237,0.1)] border border-glass-border/40 overflow-hidden scroll-mt-28"
    >
      <div className="flex items-center gap-3 mb-2">
        <Key className="w-6 h-6 text-primary" />
        <h2 className="font-headline text-2xl sm:text-3xl text-color-offwhite">
          Security &amp; Authentication
        </h2>
      </div>
      <p className="font-body text-sm text-secondary mb-8">
        Hardware boundary assertions and active cryptographically signed device sessions.
      </p>

      {feedback && (
        <div className="mb-6 p-3 rounded-xl bg-surface-container-high/60 border border-glass-border text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Hardware Key Row */}
        <div className="p-5 rounded-2xl bg-surface-container/60 shadow-[inset_0_1px_0_0_rgba(245,242,237,0.06)] border border-glass-border/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-surface-bright flex items-center justify-center text-primary shadow-[inset_0_1px_0_0_rgba(245,242,237,0.1)] shrink-0">
                <Usb className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-title text-base font-semibold text-color-offwhite">
                    Hardware Key (WebAuthn / YubiKey 5C)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-risk-low/20 text-risk-low font-mono text-[11px] font-semibold">
                    Primary
                  </span>
                </div>
                <span className="font-body text-xs text-secondary mt-0.5 block">
                  FIDO2 / U2F Level 3 attestation registered on May 12
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleConfigureKey}
              className="self-start sm:self-center px-4 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-bright text-color-offwhite font-body text-sm transition-all shadow-[inset_0_1px_0_0_rgba(245,242,237,0.1)] cursor-pointer"
            >
              Configure
            </button>
          </div>
        </div>

        {/* TOTP Backup Row */}
        <div className="p-5 rounded-2xl bg-surface-container/60 shadow-[inset_0_1px_0_0_rgba(245,242,237,0.06)] border border-glass-border/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-surface-bright flex items-center justify-center text-secondary shadow-[inset_0_1px_0_0_rgba(245,242,237,0.1)] shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-title text-base font-semibold text-color-offwhite">
                    TOTP Authenticator App
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-secondary font-mono text-[11px]">
                    Secondary Backup
                  </span>
                </div>
                <span className="font-body text-xs text-secondary mt-0.5 block">
                  Time-based one-time password generated via internal authenticator
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRegenerateTotp}
              className="self-start sm:self-center px-4 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-bright text-color-offwhite font-body text-sm transition-all shadow-[inset_0_1px_0_0_rgba(245,242,237,0.1)] cursor-pointer"
            >
              Regenerate
            </button>
          </div>
        </div>

        {/* Toggle: Biometric Passkey Requirement */}
        <div className="flex items-start justify-between gap-6 p-5 rounded-2xl bg-surface-container/60 shadow-[inset_0_1px_0_0_rgba(245,242,237,0.06)] border border-glass-border/30">
          <div>
            <span className="font-title text-base font-semibold text-color-offwhite block">
              Biometric Passkey Required for Destructive Changes
            </span>
            <p className="font-body text-xs text-secondary mt-1">
              Requires Touch ID, Face ID, or Windows Hello prior to altering audit retention policies or deleting neural scan banks.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={biometricEnabled}
              onChange={() => setBiometricEnabled(!biometricEnabled)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-risk-high after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-color-offwhite after:rounded-full after:h-[18px] after:w-[18px] after:transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]" />
          </label>
        </div>

        {/* Active Sessions Header & List */}
        <div className="pt-4">
          <span className="font-mono text-xs uppercase tracking-widest text-secondary block mb-3">
            Active Verified Sessions (2 Devices)
          </span>
          <div className="space-y-3">
            {/* Session 1: Current */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-low shadow-[inset_0_1px_0_0_rgba(245,242,237,0.04)] border border-glass-border/30">
              <div className="flex items-center gap-3.5">
                <Laptop className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-title text-sm font-semibold text-color-offwhite">
                      Operative Workstation (Localhost)
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-risk-low/20 text-risk-low font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-pulse" />
                      Current Session
                    </span>
                  </div>
                  <span className="font-mono text-xs text-secondary">
                    Local Terminal • IP: 127.0.0.1 • HS256 Signed
                  </span>
                </div>
              </div>
              <span className="font-mono text-xs text-risk-low self-start sm:self-center font-semibold">
                MUTUAL-TLS SECURE
              </span>
            </div>

            {/* Session 2: Mobile */}
            {!mobileSessionRevoked ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-low shadow-[inset_0_1px_0_0_rgba(245,242,237,0.04)] border border-glass-border/30">
                <div className="flex items-center gap-3.5">
                  <Smartphone className="w-5 h-5 text-secondary shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-title text-sm font-semibold text-color-offwhite">
                        iPhone 15 Pro Guard Node
                      </span>
                      <span className="text-secondary text-[11px] font-mono">
                        Safari Mobile
                      </span>
                    </div>
                    <span className="font-mono text-xs text-secondary">
                      Family Circle Relay • Active 2 hours ago
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRevokeSession}
                  className="self-start sm:self-center px-4 py-1.5 rounded-full bg-surface-container-high hover:bg-risk-high/20 hover:text-primary text-secondary font-body text-sm transition-all shadow-[inset_0_1px_0_0_rgba(245,242,237,0.06)] cursor-pointer"
                >
                  Revoke Access
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-surface-container-low/50 border border-glass-border/20 text-xs font-mono text-secondary">
                iPhone 15 Pro session revoked.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
