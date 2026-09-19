import React, { useState } from 'react';
import {
  Shield,
  Lock,
  FileText,
  AlertTriangle,
  Server,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ExternalLink,
  PhoneCall,
  EyeOff,
} from 'lucide-react';

interface PolicyDocument {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  summary: string;
  content: React.ReactNode;
}

export const GovernanceSection: React.FC = () => {
  const [activeDocId, setActiveDocId] = useState<string | null>(null);

  const toggleDoc = (id: string) => {
    setActiveDocId((prev) => (prev === id ? null : id));
  };

  const documents: PolicyDocument[] = [
    {
      id: 'privacy',
      title: 'Privacy Policy & Data Sovereignty',
      category: 'DATA GOVERNANCE',
      icon: <EyeOff className="w-5 h-5 text-risk-low" />,
      summary: 'Zero-knowledge client persistence, ephemeral scan processing, and no persistent message storage.',
      content: (
        <div className="space-y-4 text-xs font-body leading-relaxed text-on-surface-variant">
          <div>
            <h5 className="font-headline text-sm text-color-offwhite mb-1">1. Ephemeral Scan Processing</h5>
            <p>
              ScamShield processes all text, screenshot, and URL scan requests ephemerally. Raw scan payloads (such as
              inbound SMS text, WhatsApp message snippets, or uploaded images) are processed in volatile container memory
              strictly for the duration of inference. We do not use user submission data to train public foundation models.
            </p>
          </div>

          <div>
            <h5 className="font-headline text-sm text-color-offwhite mb-1">2. Local-First Client Storage & Sanitization</h5>
            <p>
              Scan history logs stored in browser local storage are automatically sanitized on device before storage:
              sensitive tokens, full target URLs, and phone numbers are truncated and redacted. You retain full control to
              export or purge your local scan history at any time from the History dashboard.
            </p>
          </div>

          <div>
            <h5 className="font-headline text-sm text-color-offwhite mb-1">3. Zero Third-Party Advertising & Tracking</h5>
            <p>
              ScamShield does not integrate third-party advertising cookies, cross-site trackers, or commercial telemetry
              SDKs. Authenticated sessions rely on secure, HttpOnly, and cryptographically verified AWS Cognito JSON Web
              Tokens.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'security',
      title: 'Security Architecture & Cloud Controls',
      category: 'CRYPTOGRAPHIC DEFENSE',
      icon: <Lock className="w-5 h-5 text-primary" />,
      summary: 'TLS 1.3 in-transit encryption, AWS Secrets Manager key segregation, and isolated ECS containers.',
      content: (
        <div className="space-y-4 text-xs font-body leading-relaxed text-on-surface-variant">
          <div>
            <h5 className="font-headline text-sm text-color-offwhite mb-1">1. Cryptographic Transport Security</h5>
            <p>
              All traffic between client devices, the Vercel edge frontend, and the Amazon ECS backend is strictly
              enforced over TLS 1.3 with forward secrecy cipher suites (AES-256-GCM / ChaCha20-Poly1305). Plaintext HTTP
              connections are automatically dropped at the ingress perimeter.
            </p>
          </div>

          <div>
            <h5 className="font-headline text-sm text-color-offwhite mb-1">2. IAM & Secrets Segregation</h5>
            <p>
              Underlying backend microservices run under least-privilege AWS IAM execution roles within the ap-south-1
              region. High-entropy API keys (such as Google Gemini API credentials) are fetched strictly via AWS Secrets
              Manager at container initialization; zero plaintext API keys are baked into Docker images, source code, or
              client-side bundles.
            </p>
          </div>

          <div>
            <h5 className="font-headline text-sm text-color-offwhite mb-1">3. Network-Isolated Link Forensics</h5>
            <p>
              Link Shield performs deep lexical and structural URL analysis without performing outbound DNS resolution or
              HTTP crawling to the suspect domain. This eliminates Server-Side Request Forgery (SSRF) vulnerabilities and
              prevents attacker-controlled servers from logging user IP addresses or triggering weaponized payloads.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'terms',
      title: 'Terms of Service & Acceptable Use',
      category: 'LEGAL AGREEMENT',
      icon: <FileText className="w-5 h-5 text-color-offwhite" />,
      summary: 'Authorized personal and defensive usage terms, non-liability clauses, and account responsibilities.',
      content: (
        <div className="space-y-4 text-xs font-body leading-relaxed text-on-surface-variant">
          <div>
            <h5 className="font-headline text-sm text-color-offwhite mb-1">1. Defensive Use Authorization</h5>
            <p>
              ScamShield is engineered exclusively for sovereign, defensive fraud mitigation and digital threat awareness.
              You agree not to use ScamShield to reverse-engineer detection logic, orchestrate automated vulnerability
              probes, or bypass security perimeters.
            </p>
          </div>

          <div>
            <h5 className="font-headline text-sm text-color-offwhite mb-1">2. No Financial Guarantee</h5>
            <p>
              ScamShield serves as an intelligent advisory assistant to help identify deceptive patterns. Detection verdicts
              do not constitute legal or financial warranty. Users must never share OTPs, UPI PINs, or banking passwords
              regardless of heuristic scores.
            </p>
          </div>

          <div>
            <h5 className="font-headline text-sm text-color-offwhite mb-1">3. Family Defense Sharing</h5>
            <p>
              When sharing threats with family members via the Family Protection Circle, only sanitized threat metadata and
              threat vectors are broadcast. You represent that shared threats do not contain private third-party personal
              records or unredacted confidential disclosures.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'disclaimer',
      title: 'AI Analysis & Emergency Fraud Guidance',
      category: 'SAFETY ADVISORY',
      icon: <AlertTriangle className="w-5 h-5 text-color-crimson" />,
      summary: 'Probabilistic AI inference limitations, false positive/negative disclosures, and official helplines.',
      content: (
        <div className="space-y-4 text-xs font-body leading-relaxed text-on-surface-variant">
          <div>
            <h5 className="font-headline text-sm text-color-offwhite mb-1">1. Probabilistic Inference Disclosure</h5>
            <p>
              Threat assessments are generated using large multimodal models and heuristic classifiers. While tuned for high
              precision against Indian financial fraud templates (e.g. KYC expirations, lottery scams, fake parcel
              tracking), emerging zero-day deception techniques or novel social engineering schemes may produce false
              negatives or false positives.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-color-crimson/15 border border-color-crimson/40 space-y-2">
            <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase">
              <PhoneCall className="w-4 h-4" />
              <span>Official Indian Cybercrime Escalation</span>
            </div>
            <p className="text-color-offwhite text-xs">
              If you have already sent money, shared an OTP, or compromised your bank account, immediately contact the
              National Cyber Crime Reporting Helpline:
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="tel:1930"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-color-crimson text-color-offwhite font-mono text-xs font-semibold hover:brightness-110 transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call 1930 (Toll-Free)</span>
              </a>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-glass-border text-color-offwhite font-mono text-xs hover:bg-surface-container-highest transition-all"
              >
                <span>cybercrime.gov.in</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'system',
      title: 'About ScamShield & Cluster Telemetry',
      category: 'OPERATIONAL SPECS',
      icon: <Server className="w-5 h-5 text-secondary" />,
      summary: 'Production runtime specs, ECS cluster version, ap-south-1 region, and operational health.',
      content: (
        <div className="space-y-4 text-xs font-body leading-relaxed text-on-surface-variant">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-surface-container-lowest/80 border border-glass-border">
              <span className="text-[10px] text-on-surface-variant/80 uppercase block">HOST ENVIRONMENT</span>
              <span className="text-color-offwhite font-semibold">Amazon ECS Fargate (ap-south-1)</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-lowest/80 border border-glass-border">
              <span className="text-[10px] text-on-surface-variant/80 uppercase block">MULTIMODAL AI CORE</span>
              <span className="text-color-offwhite font-semibold">Gemini 2.5 Flash Neural Sentry</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-lowest/80 border border-glass-border">
              <span className="text-[10px] text-on-surface-variant/80 uppercase block">DEPLOYED BUILD</span>
              <span className="text-color-offwhite font-semibold">v1.0.4-prod (Revision 7371788)</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-lowest/80 border border-glass-border">
              <span className="text-[10px] text-on-surface-variant/80 uppercase block">EDGE INGRESS</span>
              <span className="text-color-offwhite font-semibold">Vercel Global Edge (HTTPS / TLS 1.3)</span>
            </div>
          </div>

          <div className="pt-2 text-on-surface-variant text-xs">
            For coordinated vulnerability disclosure, enterprise deployment inquiries, or security auditing, reach out
            to <span className="font-mono text-color-offwhite">security@scamshield.internal</span>.
          </div>
        </div>
      ),
    },
  ];

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
              System Governance & Legal Framework
            </h3>
            <span className="font-mono text-xs text-secondary">
              Production Release v1.0.4 • ap-south-1 Cluster
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low shadow-[inset_0_1px_0_0_rgba(245,242,237,0.04)] border border-glass-border/30 self-start md:self-center">
          <span className="w-2 h-2 rounded-full bg-risk-low animate-pulse" />
          <span className="font-mono text-xs text-secondary">
            All Detection Engines Operational
          </span>
        </div>
      </div>

      {/* Accordion Documents List */}
      <div className="pt-6 space-y-3">
        {documents.map((doc) => {
          const isOpen = activeDocId === doc.id;
          return (
            <div
              key={doc.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-surface-container-low/90 border-glass-border shadow-lg'
                  : 'bg-surface-container/40 hover:bg-surface-container/70 border-glass-border/30'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleDoc(doc.id)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer transition-colors focus:outline-none"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center border border-glass-border/40 shrink-0">
                    {doc.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                        {doc.category}
                      </span>
                    </div>
                    <h4 className="font-headline text-sm sm:text-base text-color-offwhite font-medium truncate">
                      {doc.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline-block font-mono text-[11px] text-on-surface-variant/70">
                    {isOpen ? 'Collapse' : 'Inspect'}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-color-offwhite" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-glass-border/30 animate-fadeIn">
                  <div className="mb-3 p-2.5 rounded-xl bg-surface-container-lowest/60 border border-glass-border/40 font-mono text-[11px] text-color-offwhite flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-risk-low shrink-0" />
                    <span>{doc.summary}</span>
                  </div>
                  {doc.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default GovernanceSection;
