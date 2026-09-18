import React from 'react';
import { Shield } from 'lucide-react';

export const GovernanceSection: React.FC = () => {
  const handleLinkClick = (title: string, detail: string) => {
    window.alert(`${title}\n\n${detail}`);
  };

  return (
    <section
      id="governance-section"
      className="relative rounded-3xl bg-surface-dark p-6 sm:p-8 md:p-10 shadow-[0_12px_36px_-8px_rgba(0,0,0,0.6),inset_0_1px_1px_0_rgba(245,242,237,0.1)] border border-glass-border/40 overflow-hidden scroll-mt-28"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-glass-border/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(245,242,237,0.15)] border border-glass-border/30 shrink-0">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="font-headline text-xl text-color-offwhite">
              ScamShield Neural Sentry
            </h3>
            <span className="font-mono text-xs text-secondary">
              Version 1.0.4 (Build 892-V)
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low shadow-[inset_0_1px_0_0_rgba(245,242,237,0.04)] border border-glass-border/30 self-start md:self-center">
          <span className="w-2 h-2 rounded-full bg-risk-low" />
          <span className="font-mono text-xs text-secondary">
            All Detection Engines Operational
          </span>
        </div>
      </div>

      {/* Governance Links Row */}
      <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() =>
            handleLinkClick(
              'ScamShield Privacy Policy',
              'Zero-knowledge client persistence guaranteed. Volatile memory parsing only. No transcripts or message bodies are ever saved to remote analytics.'
            )
          }
          className="p-3 rounded-xl bg-surface-container/50 hover:bg-surface-container text-secondary hover:text-color-offwhite font-body text-sm transition-all text-center cursor-pointer border border-glass-border/20"
        >
          Privacy Policy
        </button>

        <button
          type="button"
          onClick={() =>
            handleLinkClick(
              'Terms of Service',
              'Sovereign defensive usage. ScamShield assists in detecting deceptive communication patterns and impersonation vectors.'
            )
          }
          className="p-3 rounded-xl bg-surface-container/50 hover:bg-surface-container text-secondary hover:text-color-offwhite font-body text-sm transition-all text-center cursor-pointer border border-glass-border/20"
        >
          Terms of Service
        </button>

        <button
          type="button"
          onClick={() =>
            handleLinkClick(
              'Security Whitepaper',
              'Cryptographic architecture, MITRE ATT&CK T1566/T1598/T1204 mitigation, and WebAuthn / FIDO2 Level 3 attestation specifications.'
            )
          }
          className="p-3 rounded-xl bg-surface-container/50 hover:bg-surface-container text-secondary hover:text-color-offwhite font-body text-sm transition-all text-center cursor-pointer border border-glass-border/20"
        >
          Security Whitepaper
        </button>

        <button
          type="button"
          onClick={() =>
            handleLinkClick(
              'Vulnerability Disclosure Policy',
              'Coordinated disclosure protocol. Report potential vulnerabilities or security flaws directly to security@scamshield.internal.'
            )
          }
          className="p-3 rounded-xl bg-surface-container/50 hover:bg-surface-container text-secondary hover:text-color-offwhite font-body text-sm transition-all text-center cursor-pointer border border-glass-border/20"
        >
          Vulnerability Disclosure
        </button>
      </div>
    </section>
  );
};
