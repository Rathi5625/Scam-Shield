import React from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/common/PageContainer';
import { Shield, Lock, EyeOff, Server, Database, Bell, Trash2, ArrowLeft } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

export const PrivacyPolicyPage: React.FC = () => {
  usePageMeta({
    title: 'Privacy Policy — ScamShield',
    description: 'Learn how ScamShield handles your data with ephemeral scanning, zero model training, and cryptographic cloud controls.',
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
            <EyeOff className="w-4 h-4 text-risk-low" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
              TRANSPARENCY & DATA SOVEREIGNTY
            </span>
          </div>

          <h1 className="font-headline text-3xl sm:text-5xl text-color-offwhite tracking-tight">
            Privacy Policy
          </h1>

          <p className="font-mono text-xs text-on-surface-variant">
            Effective Date: September 19, 2026 • Platform Version 1.0.4-prod
          </p>
        </div>

        {/* Core Guarantee Callout */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-low/80 backdrop-blur-2xl border border-glass-border shadow-xl space-y-3">
          <div className="flex items-center gap-3 text-color-offwhite font-headline text-lg">
            <Shield className="w-5 h-5 text-primary" />
            <span>Our Foundational Commitment</span>
          </div>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            ScamShield is engineered from the ground up as a sovereign defense utility. We do not sell user data,
            we do not integrate third-party tracking cookies or behavioral advertising SDKs, and we never train public
            generative AI models on your private scan inputs.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8 font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          {/* Section 1 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-surface-container-low/40 border border-glass-border/40 space-y-3">
            <div className="flex items-center gap-2.5 font-headline text-base sm:text-lg text-color-offwhite">
              <Lock className="w-4 h-4 text-primary" />
              <h2>1. Account Information & Authentication</h2>
            </div>
            <p>
              When you create an account profile on ScamShield, your authentication credentials (email address, display
              name, and password verifier) are processed securely through enterprise identity and authentication services.
              Passwords are never stored in plaintext; they are cryptographically hashed and verified using the Secure
              Remote Password (SRP) protocol.
            </p>
            <p>
              Session authorization tokens (JWTs) are stored on your local device in browser storage (<code className="font-mono text-color-offwhite bg-surface-container px-1.5 py-0.5 rounded">localStorage</code> / <code className="font-mono text-color-offwhite bg-surface-container px-1.5 py-0.5 rounded">sessionStorage</code>)
              and transmitted across modern TLS encrypted HTTPS headers.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-surface-container-low/40 border border-glass-border/40 space-y-3">
            <div className="flex items-center gap-2.5 font-headline text-base sm:text-lg text-color-offwhite">
              <Server className="w-4 h-4 text-risk-low" />
              <h2>2. Scan Inputs & Ephemeral AI Processing</h2>
            </div>
            <p>
              When you submit an inbound SMS snippet, messaging conversation, or screenshot for fraud detection:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Ephemeral Execution:</strong> The payload is ingested into volatile server memory
                strictly for the duration of inference.
              </li>
              <li>
                <strong>AI Inference:</strong> Content is analyzed using enterprise neural threat intelligence models configured with
                zero-retention policies. Your private inputs are not used to train or fine-tune public foundation models.
              </li>
              <li>
                <strong>Prompt Injection Defense:</strong> All user content is encapsulated within immutable safety delimiters
                (<code className="font-mono text-color-offwhite">&lt;scanned_untrusted_content&gt;</code>) to prevent adversarial prompt injection.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-surface-container-low/40 border border-glass-border/40 space-y-3">
            <div className="flex items-center gap-2.5 font-headline text-base sm:text-lg text-color-offwhite">
              <Database className="w-4 h-4 text-secondary" />
              <h2>3. Scan History & Storage Architecture</h2>
            </div>
            <p>
              ScamShield implements a hybrid storage model designed to prioritize client sovereignty:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Local-First History Vault:</strong> By default, scan summaries are stored in your device's local browser storage.
                Before saving, all text previews and URLs are client-sanitized: phone numbers, authentication tokens, and private identifiers
                are automatically redacted.
              </li>
              <li>
                <strong>Cloud Storage (Amazon DynamoDB & S3):</strong> When authenticated, incident summaries and non-sensitive diagnostic
                telemetry are saved to Amazon DynamoDB tables encrypted at rest with AWS KMS managed customer keys. Uploaded screenshot
                evidence is stored in private S3 bucket <code className="font-mono text-color-offwhite">scamshield-private-761558630384</code> with
                all public access strictly blocked.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-surface-container-low/40 border border-glass-border/40 space-y-3">
            <div className="flex items-center gap-2.5 font-headline text-base sm:text-lg text-color-offwhite">
              <Shield className="w-4 h-4 text-primary" />
              <h2>4. Link Shield URL Forensics (Network Isolation)</h2>
            </div>
            <p>
              Unlike traditional crawling tools, ScamShield Link Shield evaluates suspicious URLs through static lexical and structural heuristics.
              Our systems <strong>never perform outbound HTTP requests, redirects, or DNS handshakes</strong> to the target server.
              This guarantees that attackers cannot log your IP address, fingerprint your browser, or trigger server-side malicious payloads.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-surface-container-low/40 border border-glass-border/40 space-y-3">
            <div className="flex items-center gap-2.5 font-headline text-base sm:text-lg text-color-offwhite">
              <Bell className="w-4 h-4 text-risk-medium" />
              <h2>5. Family Protection Circle & Alert Dispatch</h2>
            </div>
            <p>
              If you choose to share a threat with your Family Defense Circle, only <strong>sanitized threat metadata</strong> is broadcast:
              threat category (e.g. Banking KYC), risk tier (HIGH/MEDIUM/LOW), score, and recommended countermeasure.
            </p>
            <p className="font-semibold text-color-offwhite">
              Under no circumstances are passwords, OTPs, UPI PINs, raw personal chat histories, or recipient contact lists shared with family members or external parties.
            </p>
            <p>
              Emergency alerts are dispatched through Amazon SNS topics exclusively to verified phone numbers or email addresses authorized by circle members.
            </p>
          </section>

          {/* Section 6 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-surface-container-low/40 border border-glass-border/40 space-y-3">
            <div className="flex items-center gap-2.5 font-headline text-base sm:text-lg text-color-offwhite">
              <Trash2 className="w-4 h-4 text-color-crimson" />
              <h2>6. Data Deletion & User Rights</h2>
            </div>
            <p>
              You maintain sovereign rights over your data:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Local History Purge:</strong> You can purge all client-stored scan history at any time with a single click from the History dashboard.
              </li>
              <li>
                <strong>Account & Cloud Deletion:</strong> You may request complete erasure of your profile, scan history, and stored artifacts
                by contacting our privacy desk at <code className="font-mono text-color-offwhite">privacy@scamshield.org</code>.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-surface-container-low/40 border border-glass-border/40 space-y-3">
            <div className="flex items-center gap-2.5 font-headline text-base sm:text-lg text-color-offwhite">
              <Server className="w-4 h-4 text-on-surface-variant" />
              <h2>7. Third-Party Infrastructure Sub-Processors</h2>
            </div>
            <p>
              ScamShield operates strictly on audited enterprise-grade cloud partners:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Enterprise Cloud Infrastructure:</strong> Secure container compute, isolated encrypted database vaults, encrypted storage, and real-time notification relays.</li>
              <li><strong>Enterprise AI Intelligence:</strong> Neural language and vision threat classification via secure enterprise API endpoints with zero data retention.</li>
              <li><strong>Secure Edge Delivery:</strong> Global CDN and edge delivery of the web application frontend with strict TLS encryption.</li>
            </ul>
          </section>
        </div>
      </div>
    </PageContainer>
  );
};

export default PrivacyPolicyPage;
