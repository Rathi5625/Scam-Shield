import React from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/common/PageContainer';
import { Shield, FileText, AlertTriangle, Users, PhoneCall, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

export const TermsPage: React.FC = () => {
  usePageMeta({
    title: 'Terms & Conditions — ScamShield',
    description: 'Terms of service, acceptable use policies, and liability limitations for ScamShield threat detection.',
  });

  return (
    <PageContainer maxWidth="xl">
      <div className="py-12 sm:py-16 space-y-10 animate-fadeIn text-left">
        {/* Back Navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-xs text-on-surface-variant hover:text-color-offwhite transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Command Center</span>
        </Link>

        {/* Header Eyebrow */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-high/60 border border-glass-border">
            <FileText className="w-4 h-4 text-primary" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
              LEGAL AGREEMENT & ACCEPTABLE USE
            </span>
          </div>

          <h1 className="font-headline text-3xl sm:text-5xl text-color-offwhite tracking-tight">
            Terms &amp; Conditions
          </h1>

          <p className="font-mono text-xs text-on-surface-variant">
            Last Updated: September 19, 2026 • Platform Version 1.0.4-prod
          </p>
        </div>

        {/* Advisory Callout */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-low/80 backdrop-blur-2xl border border-glass-border shadow-xl space-y-3">
          <div className="flex items-center gap-3 text-color-offwhite font-headline text-lg">
            <Shield className="w-5 h-5 text-primary" />
            <span>Defensive Purpose Notice</span>
          </div>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            ScamShield is provided strictly as an advisory threat mitigation tool. It assists individuals and family
            circles in recognizing deceptive communication patterns and fraudulent social engineering. By accessing
            or using ScamShield, you agree to comply with these terms.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8 font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          {/* Section 1 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-surface-container-low/40 border border-glass-border/40 space-y-3">
            <div className="flex items-center gap-2.5 font-headline text-base sm:text-lg text-color-offwhite">
              <CheckCircle2 className="w-4 h-4 text-risk-low" />
              <h2>1. Acceptable Defensive Use</h2>
            </div>
            <p>
              You agree to use ScamShield solely for lawful, defensive fraud awareness purposes. You may submit suspicious
              text messages, unsolicited notifications, screenshots, and URLs received by you or your authorized family members
              to evaluate threat indicators.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-surface-container-low/40 border border-glass-border/40 space-y-3">
            <div className="flex items-center gap-2.5 font-headline text-base sm:text-lg text-color-offwhite">
              <AlertTriangle className="w-4 h-4 text-color-crimson" />
              <h2>2. Prohibited Misuse & Security Boundaries</h2>
            </div>
            <p>
              You expressly agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use ScamShield to probe, reverse-engineer, or circumvent security systems or rate limiters.</li>
              <li>Orchestrate automated denial-of-service or high-frequency vulnerability scans against our backend endpoints.</li>
              <li>Submit malicious code, exploits, or illegal contraband materials to the scanning engines.</li>
              <li>Attempt to extract private training data or proprietary model weights through prompt injection attacks.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-surface-container-low/40 border border-glass-border/40 space-y-3">
            <div className="flex items-center gap-2.5 font-headline text-base sm:text-lg text-color-offwhite">
              <Shield className="w-4 h-4 text-primary" />
              <h2>3. AI Probabilistic Nature & Scam Detection Limitations</h2>
            </div>
            <p>
              ScamShield utilizes advanced large multimodal language models and deterministic heuristic algorithms. However:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Probabilistic Results:</strong> Risk scores (0–100) and risk tiers (LOW/MEDIUM/HIGH) reflect probabilistic
                pattern matching against known deception templates. They do not constitute guaranteed guarantees or definitive legal proof.
              </li>
              <li>
                <strong>Emerging Fraud Tactics:</strong> Novel zero-day social engineering vectors or highly customized spear-phishing ploys
                may yield false negatives. Conversely, legitimate but aggressively worded corporate notices may trigger false positives.
              </li>
              <li>
                <strong>Human Responsibility:</strong> You retain sole responsibility for your financial decisions. Never share an OTP, UPI PIN,
                NetBanking password, or Aadhaar identity document regardless of any scan score.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-surface-container-low/40 border border-glass-border/40 space-y-3">
            <div className="flex items-center gap-2.5 font-headline text-base sm:text-lg text-color-offwhite">
              <Users className="w-4 h-4 text-risk-medium" />
              <h2>4. Family Protection Circle Usage</h2>
            </div>
            <p>
              The Family Protection Circle feature allows members to share warnings with authorized family contacts.
              By sharing a threat alert, you warrant that you are authorized to share the sanitized summary and that the
              payload does not violate any third party's personal confidentiality.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-surface-container-low/40 border border-glass-border/40 space-y-3">
            <div className="flex items-center gap-2.5 font-headline text-base sm:text-lg text-color-offwhite">
              <AlertTriangle className="w-4 h-4 text-on-surface-variant" />
              <h2>5. Limitation of Liability</h2>
            </div>
            <p>
              To the maximum extent permitted under applicable law, ScamShield, its operators, contributors, and cloud infrastructure
              providers shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including
              but not limited to financial loss, unauthorized bank transactions, data compromise, or emotional distress resulting from
              reliance upon heuristic scan outputs or inability to access the service.
            </p>
          </section>

          {/* Emergency Helpline Callout */}
          <div className="p-5 rounded-2xl bg-color-crimson/15 border border-color-crimson/40 space-y-3">
            <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase">
              <PhoneCall className="w-4 h-4" />
              <span>Official Indian Cybercrime Escalation</span>
            </div>
            <p className="text-color-offwhite text-xs leading-relaxed">
              If you have already transferred funds to a fraudulent party or compromised your bank credentials, contact
              the Government of India National Cyber Crime Reporting Portal immediately:
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="tel:1930"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-color-crimson text-color-offwhite font-mono text-xs font-semibold hover:brightness-110 transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call 1930 (Toll-Free Helpline)</span>
              </a>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-surface-container-high border border-glass-border text-color-offwhite font-mono text-xs hover:bg-surface-container-highest transition-all"
              >
                <span>cybercrime.gov.in</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default TermsPage;
