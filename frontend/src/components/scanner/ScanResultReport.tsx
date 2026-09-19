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
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { familyRepository } from '../../services/family/LocalFamilyProtectionRepository';
import { ShareThreatModal } from '../family/ShareThreatModal';

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
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharedSuccess, setSharedSuccess] = useState(false);

  const isScreenshot = analysisSource?.toLowerCase().includes('screenshot');

  const detectedUrls = React.useMemo(() => {
    if (scanResult.urlForensics?.url) {
      return [scanResult.urlForensics.url];
    }
    if (!originalMessage) return [];
    const urlRegex = /(?:https?:\/\/|www\.)[^\s]+/gi;
    const matches = originalMessage.match(urlRegex);
    return matches ? Array.from(new Set(matches)) : [];
  }, [originalMessage, scanResult.urlForensics]);

  const handleOpenShareModal = () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setShowShareModal(true);
  };

  const handleConfirmShare = async () => {
    if (!user) return;
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

          {/* FIX 2: Show chip always; display actual value or 'Confidence unavailable' when null */}
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-lowest/50 border border-glass-border">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>
              CONFIDENCE:{' '}
              {scanResult.confidence != null ? (
                <strong className="text-color-offwhite">{scanResult.confidence}%</strong>
              ) : (
                <strong className="text-on-surface-variant italic">Unavailable</strong>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-lowest/50 border border-glass-border">
            <span className="w-1.5 h-1.5 rounded-full bg-risk-low" />
            <span>
              ANALYSIS: <strong className="text-color-offwhite">{scanResult.engineName && !scanResult.engineName.toLowerCase().includes('gemini') && !scanResult.engineName.toLowerCase().includes('bedrock') ? scanResult.engineName : 'AI Threat Intelligence'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-lowest/50 border border-glass-border">
            <Lock className="w-3.5 h-3.5 text-risk-low" />
            <span className="text-risk-low font-medium">EPHEMERAL • ZERO RETENTION</span>
          </div>
        </div>
      </section>

      {/* High-Risk Family Protection Alert Banner */}
      {scanResult.riskLevel === 'HIGH' && (
        <section className="rounded-3xl bg-color-crimson/15 border border-color-crimson/40 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden text-left">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-color-crimson/25 border border-color-crimson/60 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold bg-color-crimson text-color-offwhite">
                  URGENT ACTION
                </span>
                <span className="font-mono text-xs text-on-surface-variant">
                  THREAT CLASSIFICATION: HIGH CONFIDENCE
                </span>
              </div>
              <h3 className="font-headline text-lg sm:text-xl text-color-offwhite">
                Protect your loved ones from this threat pattern
              </h3>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                Scammers frequently target multiple family members with identical financial or phishing ploys.
                Broadcast a sanitized alert to your Family Shield Circle now.
              </p>
            </div>
          </div>

          <GlassButton
            variant="danger"
            size="md"
            onClick={handleOpenShareModal}
            icon={<Users className="w-4 h-4" />}
            className="shrink-0 w-full md:w-auto cursor-pointer"
          >
            {sharedSuccess ? 'Alert Broadcasted!' : 'Alert Family Members'}
          </GlassButton>
        </section>
      )}

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

      {/* DETERMINISTIC EVIDENCE TRAIL: URL Forensic Analysis (Deterministic Heuristics) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1 border-b border-glass-border/40 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="font-headline text-2xl sm:text-3xl text-color-offwhite">
              URL Forensic Analysis
            </h2>
          </div>
          <span className="font-mono text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded">
            ZERO-NETWORK LEXICAL HEURISTICS
          </span>
        </div>

        {scanResult.urlForensics ? (
          <div className="p-6 rounded-2xl bg-surface-container-lowest/90 border border-glass-border space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-glass-border/50">
              <div className="space-y-1 min-w-0 flex-1">
                <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                  DETECTED URL (DETERMINISTIC EXTRACT)
                </span>
                <div className="flex items-center gap-2 text-color-offwhite font-mono text-sm break-all">
                  <Link2Off className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-semibold">{scanResult.urlForensics.url || detectedUrls[0] || 'Unknown URL'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto bg-surface-container-high/60 px-4 py-2 rounded-xl border border-glass-border shrink-0">
                <span className="font-mono text-xs text-on-surface-variant uppercase">
                  RAW HEURISTIC SCORE:
                </span>
                <span className={`font-mono text-base font-bold ${
                  (scanResult.urlForensics.riskScore ?? 0) >= 50 ? 'text-primary' : 'text-risk-low'
                }`}>
                  {scanResult.urlForensics.riskScore != null ? `${scanResult.urlForensics.riskScore}/100` : 'N/A'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider block">
                SPECIFIC FORENSIC REASONS
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                {scanResult.urlForensics.reasons.map((reason, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low/50 border border-glass-border/60"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-color-offwhite">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono text-on-surface-variant border-t border-glass-border/40">
              <span>* Deterministic lexical analysis — evaluated independently of LLM reasoning without network dispatch.</span>
              <span>INCIDENT #{scanResult.urlForensics.scanId}</span>
            </div>
          </div>
        ) : isScreenshot ? (
          <div className="p-5 rounded-2xl bg-surface-container-lowest/80 border border-glass-border flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-risk-low/20 border border-risk-low/50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-risk-low" />
            </div>
            <div className="space-y-0.5">
              <p className="font-mono text-xs text-color-offwhite font-medium">
                No URL detected in this screenshot after visual analysis
              </p>
              <p className="font-mono text-[11px] text-on-surface-variant">
                Multimodal OCR inspection confirmed zero URL patterns or hyperlinks in the visual screenshot data.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-surface-container-lowest/60 border border-glass-border/60 flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-risk-low shrink-0" />
            <p className="font-mono text-xs text-on-surface-variant">
              No URL detected in this message. Lexical URL forensic pipeline was not triggered.
            </p>
          </div>
        )}
      </section>

      {/* FIX 6: AI-generated explanation block — summary, explanation, indicators */}
      {(scanResult.summary || scanResult.explanation || (scanResult.indicators && scanResult.indicators.length > 0)) && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1 border-b border-glass-border/40 pb-4">
            <FileSearch className="w-5 h-5 text-primary" />
            <h2 className="font-headline text-2xl sm:text-3xl text-color-offwhite">AI Analysis Summary</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {scanResult.summary && (
              <div className="p-5 rounded-2xl bg-surface-container-lowest/80 border border-glass-border space-y-2">
                <p className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">THREAT SUMMARY</p>
                <p className="font-body text-sm text-color-offwhite leading-relaxed">{scanResult.summary}</p>
              </div>
            )}

            {scanResult.explanation && (
              <div className="p-5 rounded-2xl bg-surface-container-lowest/80 border border-glass-border space-y-2">
                <p className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">REASONING</p>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">{scanResult.explanation}</p>
              </div>
            )}
          </div>

          {scanResult.indicators && scanResult.indicators.length > 0 && (
            <div className="p-5 rounded-2xl bg-surface-container-lowest/80 border border-glass-border space-y-3">
              <p className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">EVIDENCE TOKENS</p>
              <div className="flex flex-wrap gap-2">
                {scanResult.indicators.map((ind, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full bg-surface-container-high text-xs font-mono text-color-offwhite border border-glass-border"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

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
                  (isScreenshot
                    ? 'Visual screenshot binary data analyzed directly via neural multimodal pipeline.'
                    : 'No raw message text supplied.')}
              </p>
            </div>

            {/* URL Presence or Absence Confirmation */}
            <div className="p-3.5 rounded-xl bg-surface-container-low/50 border border-glass-border space-y-2">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-on-surface-variant uppercase tracking-wider">URL FORENSIC VERIFICATION</span>
                <span className="text-color-offwhite">{detectedUrls.length} Detected</span>
              </div>
              {detectedUrls.length > 0 ? (
                <div className="space-y-1.5 font-mono text-xs">
                  {detectedUrls.map((detectedUrl, i) => (
                    <div key={i} className="flex items-center gap-2 text-color-offwhite break-all bg-surface-container-lowest/70 p-2 rounded border border-glass-border/40">
                      <Link2Off className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{detectedUrl}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-mono text-xs text-on-surface-variant">
                  {isScreenshot ? 'No URL detected in this screenshot.' : 'No URL detected in this message.'}
                </p>
              )}
            </div>

            {/* Dynamic Evidence Signals Derived From Real Analysis */}
            {scanResult.redFlags && scanResult.redFlags.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {scanResult.redFlags.slice(0, 2).map((rf, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-surface-container-low/50 border border-glass-border space-y-1">
                    <div className="flex items-center gap-1.5 text-primary font-mono text-xs uppercase font-medium">
                      {getFlagIcon(rf.type)} {rf.type.replace(/_/g, ' ')}
                    </div>
                    <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                      {rf.label}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-surface-container-low/50 border border-glass-border">
                <p className="font-mono text-xs text-on-surface-variant">
                  No anomalous linguistic coercion or exploitation indicators isolated.
                </p>
              </div>
            )}
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
          onClick={handleOpenShareModal}
          icon={sharedSuccess ? <CheckCircle2 className="w-4 h-4 text-risk-low" /> : <Users className="w-4 h-4" />}
        >
          {sharedSuccess ? 'Shared to Family Feed!' : 'Share with Family Shield'}
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

      {/* Family Alert Confirmation Modal */}
      <ShareThreatModal
        isOpen={showShareModal}
        threat={{
          sharedBy: user?.displayName || user?.email?.split('@')[0] || 'You',
          scanType: analysisSource?.toLowerCase().includes('screenshot') ? 'SCREENSHOT' : 'TEXT',
          riskLevel: scanResult.riskLevel,
          riskScore: scanResult.riskScore,
          category: scanResult.category,
          summary: scanResult.action || `${scanResult.category.replace(/_/g, ' ')} threat pattern analyzed.`,
        }}
        onClose={() => setShowShareModal(false)}
        onConfirm={handleConfirmShare}
      />
    </div>
  );
};
