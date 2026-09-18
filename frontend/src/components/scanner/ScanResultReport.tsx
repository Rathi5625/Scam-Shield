import React, { useState } from 'react';
import type { ScanResponse, RedFlag } from '../../types/api';
import { RiskScore } from '../common/RiskScore';
import { RiskBar } from '../common/RiskBar';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { MitigationChecklist } from '../common/MitigationChecklist';
import {
  RotateCcw,
  Users,
  ChevronDown,
  ChevronUp,
  Terminal,
  Clock,
  Shield,
  AlertTriangle,
  Lock,
  FileSearch,
  Hourglass,
  Wallet,
  Link2Off,
  Drama,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { familyRepository } from '../../services/family/LocalFamilyProtectionRepository';

interface ScanResultReportProps {
  scanResult: ScanResponse;
  originalMessage?: string;
  analysisSource?: string;
  onScanAnother: () => void;
}

export const ScanResultReport: React.FC<ScanResultReportProps> = ({
  scanResult,
  originalMessage,
  analysisSource = 'MESSAGE ANALYSIS',
  onScanAnother,
}) => {
  const { user } = useAuth();
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [sharedSuccess, setSharedSuccess] = useState(false);

  const handleShareWithFamily = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      setIsSharing(true);
      const group = await familyRepository.getFamilyGroup(user.id);
      if (group) {
        await familyRepository.shareThreat({
          familyGroupId: group.id,
          sharedBy: user.displayName || user.email.split('@')[0],
          scanType: analysisSource?.toLowerCase().includes('screenshot') ? 'SCREENSHOT' : 'TEXT',
          riskLevel: scanResult.riskLevel,
          riskScore: scanResult.riskScore,
          category: scanResult.category,
          summary: scanResult.action || `${scanResult.category.replace(/_/g, ' ')} threat analyzed`,
          vector: analysisSource?.toLowerCase().includes('screenshot') ? 'Visual OCR Telemetry' : 'Inbound SMS Gate',
        });
        setSharedSuccess(true);
      } else {
        window.location.href = '/family-protection';
      }
    } catch (err) {
      console.warn('ScamShield: Failed to share threat with family', err);
    } finally {
      setIsSharing(false);
    }
  };

  // Icon mapping for red flag types
  const getFlagIcon = (type: string) => {
    switch (type) {
      case 'URGENCY':
        return <Hourglass className="w-4 h-4 text-primary" />;
      case 'FINANCIAL_REQUEST':
        return <Wallet className="w-4 h-4 text-primary" />;
      case 'SUSPICIOUS_LINK':
        return <Link2Off className="w-4 h-4 text-primary" />;
      case 'IMPERSONATION':
        return <Drama className="w-4 h-4 text-primary" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-primary" />;
    }
  };

  // Dynamic headline based on authoritative backend riskLevel
  const headline = (() => {
    switch (scanResult.riskLevel) {
      case 'HIGH':
        return 'This looks risky.';
      case 'MEDIUM':
        return 'Exercise caution.';
      case 'LOW':
        return 'No immediate threats detected.';
      case 'UNKNOWN':
      default:
        return 'Inconclusive telemetry.';
    }
  })();

  const subheadline = (() => {
    switch (scanResult.riskLevel) {
      case 'HIGH':
        return 'This message contains high-confidence signals commonly associated with targeted credential harvesting and social engineering.';
      case 'MEDIUM':
        return 'This message displays anomalous patterns frequently observed in unsolicited promotional or delivery scams.';
      case 'LOW':
        return 'Standard conversational patterns identified. No indicators of financial coercion or credential requests detected.';
      case 'UNKNOWN':
      default:
        return 'ScamShield could not confidently classify this snippet. The content was too brief or unpatterned for reliable analysis.';
    }
  })();

  return (
    <div className="space-y-12 animate-fadeIn max-w-7xl mx-auto">
      {/* Top Header Eyebrow */}
      <section className="relative flex flex-col items-center text-center space-y-6">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface-container-high/60 backdrop-blur-xl border border-glass-border shadow-lg">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                scanResult.riskLevel === 'HIGH'
                  ? 'bg-color-crimson'
                  : scanResult.riskLevel === 'MEDIUM'
                  ? 'bg-risk-medium'
                  : 'bg-risk-low'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                scanResult.riskLevel === 'HIGH'
                  ? 'bg-color-crimson'
                  : scanResult.riskLevel === 'MEDIUM'
                  ? 'bg-risk-medium'
                  : 'bg-risk-low'
              }`}
            />
          </span>
          <span className="font-mono text-xs text-on-surface tracking-wider uppercase">
            {analysisSource} • REPORT #{scanResult.scanId}
          </span>
        </div>

        <div className="max-w-3xl space-y-3">
          <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl text-color-offwhite tracking-tight">
            {headline}
          </h1>
          <p className="font-body text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            {subheadline}
          </p>
        </div>

        {/* Circular Gauge */}
        <RiskScore
          score={scanResult.riskScore}
          level={scanResult.riskLevel}
          subtitle={
            scanResult.riskLevel === 'HIGH'
              ? 'Immediate Threat Vectors Detected'
              : scanResult.riskLevel === 'MEDIUM'
              ? 'Moderate Risk Heuristics Flagged'
              : scanResult.riskLevel === 'LOW'
              ? 'Clean Baseline Telemetry'
              : 'Insufficient Data for Risk Assessment'
          }
        />

        {/* Telemetry Chips */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-on-surface-variant text-xs font-mono">
          {scanResult.latencySeconds !== undefined && (
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-lowest/50 border border-glass-border">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>
                LATENCY: <strong className="text-color-offwhite">{scanResult.latencySeconds}s</strong>
              </span>
            </div>
          )}

          {scanResult.confidence !== undefined && (
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-lowest/50 border border-glass-border">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>
                CONFIDENCE: <strong className="text-color-offwhite">{scanResult.confidence}%</strong>
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-lowest/50 border border-glass-border">
            <span className="w-1.5 h-1.5 rounded-full bg-risk-low" />
            <span>
              ENGINE: <strong className="text-color-offwhite">MOCK ANALYSIS (Local Phase 3)</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-lowest/50 border border-glass-border">
            <Lock className="w-3.5 h-3.5 text-risk-low" />
            <span className="text-risk-low font-medium">EPHEMERAL • ZERO RETENTION</span>
          </div>
        </div>
      </section>

      {/* Red Flags / Heuristics Mapping Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-glass-border/40 pb-4">
          <div>
            <h2 className="font-headline text-2xl sm:text-3xl text-color-offwhite">
              Why this was flagged
            </h2>
            <p className="font-body text-sm text-on-surface-variant mt-1">
              Neural heuristics isolated {scanResult.redFlags?.length || 0} distinct deception mechanics across syntax, routing, and intent.
            </p>
          </div>
          <span className="font-mono text-xs uppercase tracking-wider text-on-surface-variant bg-surface-container px-3 py-1 rounded-full border border-glass-border self-start sm:self-auto">
            CATEGORY: {scanResult.category.replace(/_/g, ' ')}
          </span>
        </div>

        {scanResult.redFlags && scanResult.redFlags.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {scanResult.redFlags.map((flag: RedFlag, idx: number) => (
              <GlassCard
                key={idx}
                variant="default"
                className="flex flex-col justify-between p-6 hover:bg-surface-container-high/60 transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-outline font-semibold">
                      0{idx + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest/60 border border-glass-border flex items-center justify-center">
                      {getFlagIcon(flag.type)}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-headline text-sm uppercase tracking-wide text-color-offwhite">
                      {flag.type.replace(/_/g, ' ')}
                    </h3>
                    <p className="font-body text-xs text-on-surface-variant mt-2 leading-relaxed">
                      {flag.label}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-glass-border/40 space-y-1.5">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-on-surface-variant">Threat Weight</span>
                    <span className="text-color-offwhite font-semibold">{flag.score}%</span>
                  </div>
                  <RiskBar score={flag.score} showScore={false} />
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard variant="default" className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-3 text-risk-low">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-headline text-lg text-color-offwhite">No Red Flags Isolated</h3>
            <p className="font-body text-xs text-on-surface-variant max-w-sm mx-auto mt-1">
              The submitted payload does not trigger known fraud heuristics or deceptive patterns.
            </p>
          </GlassCard>
        )}
      </section>

      {/* Two-Column Deep Inspection Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Intercepted Message Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              <h2 className="font-headline text-xl text-color-offwhite">
                Intercepted Message Breakdown
              </h2>
            </div>
            <span className="font-mono text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded">
              TELEMETRY LOG
            </span>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-xl border border-glass-border shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between font-mono text-xs text-on-surface-variant">
              <span>
                INGESTION: <span className="text-color-offwhite">Web Analysis Console</span>
              </span>
              <span>
                TIMESTAMP: <span className="text-color-offwhite">{new Date(scanResult.createdAt).toLocaleTimeString()}</span>
              </span>
            </div>

            <div className="font-body text-sm leading-relaxed text-color-offwhite bg-surface-container-low/40 p-5 rounded-xl border border-glass-border space-y-3 font-mono">
              <p className="break-words">
                {originalMessage ||
                  'URGENT: Your account has been suspended due to unauthorized login attempts. Verify immediately to avoid permanent lockout.'}
              </p>
            </div>

            {/* Token Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-surface-container-low/50 border border-glass-border space-y-1">
                <div className="flex items-center gap-1.5 text-primary font-mono text-xs uppercase font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" /> Linguistic Urgency
                </div>
                <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                  Synthesizes immediate penalty to circumvent critical verification faculties.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low/50 border border-glass-border space-y-1">
                <div className="flex items-center gap-1.5 text-primary font-mono text-xs uppercase font-medium">
                  <Shield className="w-3.5 h-3.5" /> Authority Exploitation
                </div>
                <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                  Impersonates enterprise institution or security officer with unverified provenance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: What you should do (Mitigation Checklist) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-risk-low" />
              <h2 className="font-headline text-xl text-color-offwhite">
                What you should do
              </h2>
            </div>
            <span className="font-mono text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded">
              ACTION PROTOCOL
            </span>
          </div>

          <MitigationChecklist
            primaryAction={scanResult.action}
            riskLevel={scanResult.riskLevel}
            categoryName={scanResult.category}
          />
        </div>
      </section>

      {/* Primary Action Buttons */}
      <section className="pt-6 flex flex-wrap items-center justify-center gap-4">
        <GlassButton
          variant="primary"
          size="lg"
          onClick={onScanAnother}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Scan Another Message
        </GlassButton>

        <GlassButton
          variant="secondary"
          size="lg"
          onClick={handleShareWithFamily}
          disabled={isSharing}
          icon={sharedSuccess ? <CheckCircle2 className="w-4 h-4 text-risk-low" /> : <Users className="w-4 h-4" />}
        >
          {sharedSuccess ? 'Shared to Family Feed!' : isSharing ? 'Sharing...' : 'Share with Family Shield'}
        </GlassButton>
      </section>

      {/* Collapsible Diagnostic Payload (Developer Telemetry) */}
      <section className="max-w-4xl mx-auto pt-6">
        <div className="rounded-2xl border border-glass-border bg-surface-container-lowest/60 backdrop-blur-md overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="w-full flex items-center justify-between px-5 py-3 text-xs font-mono text-on-surface-variant hover:text-color-offwhite transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-primary" />
              <span>DIAGNOSTIC TELEMETRY PAYLOAD (DEVELOPER CONSOLE)</span>
            </div>
            {showDiagnostics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDiagnostics && (
            <div className="p-5 border-t border-glass-border bg-[#0a0a0a] text-xs font-mono text-[#a3e635] overflow-x-auto max-h-96">
              <pre className="whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(scanResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
