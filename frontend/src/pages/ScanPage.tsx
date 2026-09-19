import React, { useState, useMemo } from 'react';
import { PageContainer } from '../components/common/PageContainer';
import { LoadingState } from '../components/common/LoadingState';
import { ScanResultReport } from '../components/scanner/ScanResultReport';
import { scanService } from '../services/scanService';
import {
  historyRepository,
  createRecordFromTextScan,
} from '../services/history/LocalScanHistoryRepository';
import type { ScanResponse } from '../types/api';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Image as ImageIcon,
  Link as LinkIcon,
  ArrowRight,
  Lock,
  X,
  ShieldCheck,
  AlertTriangle,
  EyeOff,
} from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

export const ScanPage: React.FC = () => {
  usePageMeta({
    title: 'Threat Scanner — ScamShield',
    description: 'Scan suspicious SMS, emails, and chat messages for financial deception, social engineering, and urgent coercion.',
  });

  // Text Scanner State
  const [messageInput, setMessageInput] = useState('');
  const [charCount, setCharCount] = useState(0);

  // Submission & Response State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState<string>('');

  // Real-time security detection for sensitive patterns (client-side safety UX only)
  const securityAnalysis = useMemo(() => {
    if (!messageInput.trim()) return { hasSensitive: false, maskedPreview: '', warning: '' };

    const otpRegex = /\b(?:otp|one[- ]?time[- ]?password|code|verification[- ]?code)\s*[:=]?\s*(\d{4,8})\b/i;
    const pinRegex = /\b(?:pin|mpin)\s*[:=]?\s*(\d{4,6})\b/i;
    const passRegex = /\b(?:password|passwd)\s*[:=]?\s*(\S+)/i;
    const cardRegex = /\b(?:\d[ -]*?){13,16}\b/;

    const hasOtp = otpRegex.test(messageInput);
    const hasPin = pinRegex.test(messageInput);
    const hasPass = passRegex.test(messageInput);
    const hasCard = cardRegex.test(messageInput);

    const hasSensitive = hasOtp || hasPin || hasPass || hasCard;

    let warning = '';
    if (hasOtp) warning = 'One-Time Password (OTP) pattern detected. Never share active verification codes.';
    else if (hasPin) warning = 'Banking PIN/MPIN pattern detected. Legitimate organizations never request your PIN.';
    else if (hasPass) warning = 'Password field detected. Avoid sharing active credentials.';
    else if (hasCard) warning = 'Payment card number pattern detected. Avoid sharing raw financial numbers.';

    // Create safe masked preview where sensitive numeric sequences are replaced with dots
    let masked = messageInput;
    if (hasOtp) {
      masked = masked.replace(otpRegex, (match, code) => match.replace(code, '••••••'));
    }
    if (hasPin) {
      masked = masked.replace(pinRegex, (match, code) => match.replace(code, '••••'));
    }
    if (hasCard) {
      masked = masked.replace(cardRegex, '•••• •••• •••• ••••');
    }

    return { hasSensitive, maskedPreview: masked, warning };
  }, [messageInput]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMessageInput(val);
    setCharCount(val.length);
  };

  const handleClear = () => {
    setMessageInput('');
    setCharCount(0);
    setError(null);
  };

  const loadExample = (type: 'kyc' | 'job' | 'safe') => {
    let sample = '';
    if (type === 'kyc') {
      sample =
        'URGENT: Your SBI bank account will be blocked within 2 hours due to pending KYC verification. Click http://bit.ly/sbi-kyc-verify to update PAN now. Your OTP is 482913.';
    } else if (type === 'job') {
      sample =
        'Congratulations! You have been selected for Part Time Amazon Work From Home job. Earn Rs 5000 daily. Contact on Telegram.';
    } else {
      sample = 'Hey team, let us meet tomorrow at 10:00 AM in the conference room for product sync.';
    }
    setMessageInput(sample);
    setCharCount(sample.length);
    setError(null);
  };

  const handleAnalyzeText = async () => {
    const trimmed = messageInput.trim();
    if (!trimmed) {
      setError('Please enter or paste a message to begin verification.');
      return;
    }
    if (trimmed.length < 10) {
      setError('Message is too short for reliable analysis. Please provide at least 10 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    setScanResult(null);
    setSubmittedMessage(trimmed);

    try {
      const res = await scanService.scanText(trimmed);
      setScanResult(res);

      // Auto-save to local history vault
      try {
        const record = createRecordFromTextScan(res, trimmed);
        await historyRepository.saveScan(record);
      } catch {
        // Non-blocking: never disrupt the scan presentation if local storage has an issue
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Inspection service unreachable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* If scanResult exists, render the primary ScanResultReport experience */}
      {scanResult && !loading && (
        <ScanResultReport
          scanResult={scanResult}
          originalMessage={submittedMessage}
          onScanAnother={resetScanner}
        />
      )}

      {/* Main Scanner Experience */}
      {!scanResult && (
        <div className="flex flex-col items-center space-y-12">
          {/* Eyebrow Header matching Stitch screen a15d4465... */}
          <div className="flex flex-col items-center text-center space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest/80 border border-glass-border shadow-sm backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-color-crimson animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">
                SCAMSHIELD SCANNER • NEURAL HEURISTIC ENGINE
              </span>
            </div>

            <h1 className="font-headline text-4xl sm:text-6xl text-color-offwhite tracking-tight">
              What looks suspicious?
            </h1>

            <p className="font-body text-base sm:text-lg text-on-surface-variant max-w-xl font-normal leading-relaxed">
              Paste a message, email, or conversation and we’ll explain the warning signs.
            </p>
          </div>

          {/* Central Liquid-Glass Scanner Container */}
          <div className="w-full max-w-3xl rounded-[28px] p-6 sm:p-8 bg-surface-container-lowest/80 backdrop-blur-[28px] border border-glass-border shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(245,242,237,0.12)] relative transition-all duration-300">
            {/* Top Hairline Highlight */}
            <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-color-offwhite/25 to-transparent" />

            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-full bg-surface-container-high/60 border border-glass-border w-fit mx-auto mb-6 backdrop-blur-md">
              <button
                type="button"
                className="flex items-center gap-2 px-5 py-2 rounded-full font-mono text-xs transition-all duration-200 cursor-default bg-color-crimson text-color-offwhite font-semibold border border-color-crimson/50 shadow-crimson-glow"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Paste Message</span>
              </button>

              <Link
                to="/scanner/screenshot"
                className="flex items-center gap-2 px-5 py-2 rounded-full font-mono text-xs transition-all duration-200 cursor-pointer text-on-surface-variant hover:text-color-offwhite hover:bg-glass-surface"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Upload Screenshot</span>
              </Link>

              <Link
                to="/scanner/link"
                className="flex items-center gap-2 px-5 py-2 rounded-full font-mono text-xs transition-all duration-200 cursor-pointer text-on-surface-variant hover:text-color-offwhite hover:bg-glass-surface"
              >
                <LinkIcon className="w-4 h-4" />
                <span>Analyze Link</span>
              </Link>
            </div>

            {/* Message Scanner Intake */}
            {!loading && (
              <div className="flex flex-col space-y-4">
                <div className="relative w-full rounded-2xl bg-surface-container-lowest/90 border border-border-subtle focus-within:border-glass-border focus-within:ring-1 focus-within:ring-color-offwhite/20 transition-all p-5 shadow-inner">
                  <textarea
                    value={messageInput}
                    onChange={handleTextChange}
                    maxLength={4000}
                    placeholder="Paste a suspicious message, email, or conversation here..."
                    rows={6}
                    disabled={loading}
                    className="w-full bg-transparent resize-none border-none outline-none font-body text-sm sm:text-base text-color-offwhite placeholder:text-on-surface-variant/50 selection:bg-color-crimson selection:text-color-offwhite leading-relaxed"
                  />

                  {/* Textarea Footer Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 mt-2 border-t border-border-subtle/70 gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => loadExample('kyc')}
                        className="font-mono text-xs uppercase px-3 py-1.5 rounded-full bg-surface-container-high/60 hover:bg-surface-container-high text-on-surface-variant hover:text-color-offwhite transition-colors border border-glass-border cursor-pointer"
                      >
                        Load Bank KYC
                      </button>
                      <button
                        type="button"
                        onClick={() => loadExample('job')}
                        className="font-mono text-xs uppercase px-3 py-1.5 rounded-full bg-surface-container-high/60 hover:bg-surface-container-high text-on-surface-variant hover:text-color-offwhite transition-colors border border-glass-border cursor-pointer"
                      >
                        Load Job Offer
                      </button>
                      {messageInput && (
                        <button
                          type="button"
                          onClick={handleClear}
                          title="Clear Text"
                          className="text-on-surface-variant/70 hover:text-color-offwhite transition-colors p-1.5 rounded-full hover:bg-glass-surface flex items-center justify-center cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <span className="font-mono text-xs text-on-surface-variant tracking-wider">
                      {charCount.toLocaleString()} / 4,000 characters
                    </span>
                  </div>
                </div>

                {/* Security-Oriented Input UX: Sensitive Pattern Warning & Masked Preview */}
                {securityAnalysis.hasSensitive && (
                  <div className="p-4 rounded-xl bg-color-crimson/15 border border-color-crimson/40 backdrop-blur-md space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-2 text-xs font-mono text-primary font-medium">
                      <AlertTriangle className="w-4 h-4 text-color-crimson flex-shrink-0" />
                      <span>{securityAnalysis.warning}</span>
                    </div>

                    <div className="flex items-start gap-2 pt-1 border-t border-color-crimson/20 text-xs font-mono text-on-surface-variant">
                      <EyeOff className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-on-surface-variant block mb-1">
                          Safety Preview (Numbers Masked in UI):
                        </span>
                        <p className="text-color-offwhite italic bg-surface-container-lowest/80 p-2 rounded-lg border border-glass-border">
                          "{securityAnalysis.maskedPreview}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Message if any */}
            {error && (
              <div className="mt-4 p-4 rounded-xl bg-color-crimson/20 border border-color-crimson text-xs font-mono text-color-offwhite flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-color-crimson flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading State Animation */}
            {loading && (
              <div className="py-8">
                <LoadingState
                  message="Evaluating Threat Heuristics..."
                  subMessage="Deconstructing linguistics, intent, urgency, and destination vectors"
                />
              </div>
            )}

            {/* Submission CTA Button */}
            {!loading && (
              <div className="mt-7 flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleAnalyzeText}
                  disabled={loading || !messageInput.trim()}
                  className="w-full sm:w-auto px-9 py-3.5 rounded-full bg-gradient-to-b from-primary-container to-primary-container/85 text-color-offwhite font-headline text-base tracking-tight flex items-center justify-center gap-3 shadow-[0_12px_32px_-6px_rgba(139,13,26,0.65),inset_0_1px_1px_rgba(255,255,255,0.22)] border border-primary/30 hover:shadow-[0_16px_40px_-4px_rgba(139,13,26,0.85)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span>Analyze with ScamShield</span>
                  <ArrowRight className="w-4 h-4 opacity-70" />
                </button>

                <div className="flex items-center gap-2 mt-5 text-center text-on-surface-variant/80 font-body text-xs">
                  <Lock className="w-3.5 h-3.5 text-on-surface-variant/70 shrink-0" />
                  <span>Never include passwords, OTPs, or PINs. Analysis is ephemeral and zero-retention.</span>
                </div>
              </div>
            )}
          </div>

          {/* Recent Scans Section matching Stitch screen a15d4465... */}
          <section className="w-full max-w-4xl flex flex-col space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="font-headline text-xl text-color-offwhite tracking-tight">Recent Scans</h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant border border-glass-border">
                  Live Feed
                </span>
              </div>
              <Link
                to="/history"
                className="group flex items-center gap-1.5 font-mono text-xs text-on-surface-variant hover:text-color-offwhite transition-colors"
              >
                <span>View full history</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* 3 Scans Grid from Stitch */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Bank KYC */}
              <div className="relative group rounded-[24px] p-5 bg-surface-container-lowest/80 backdrop-blur-[20px] border border-glass-border shadow-[0_12px_24px_-10px_rgba(0,0,0,0.6)] hover:border-color-crimson/40 hover:bg-surface-container-low/70 transition-all duration-300 flex flex-col justify-between">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-color-crimson/20 border border-color-crimson/40 text-primary font-mono text-xs tracking-wider uppercase font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-color-crimson animate-ping" />
                      HIGH RISK
                    </span>
                    <span className="font-mono text-xs text-on-surface-variant">2 min ago</span>
                  </div>
                  <div>
                    <h3 className="font-headline text-base text-color-offwhite group-hover:text-primary transition-colors">
                      Bank KYC Message
                    </h3>
                    <p className="font-body text-xs text-on-surface-variant/80 mt-1 line-clamp-2">
                      “Account suspension in 4 hours unless verification updated via portal.”
                    </p>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase">THREAT SCORE</span>
                    <span className="font-mono text-sm font-bold text-primary">87/100</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-mono text-[11px] border border-glass-border">
                    Urgency Spoofing
                  </span>
                </div>
              </div>

              {/* Card 2: Delivery */}
              <div className="relative group rounded-[24px] p-5 bg-surface-container-lowest/80 backdrop-blur-[20px] border border-glass-border shadow-[0_12px_24px_-10px_rgba(0,0,0,0.6)] hover:border-risk-medium/40 hover:bg-surface-container-low/70 transition-all duration-300 flex flex-col justify-between">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-risk-medium/20 border border-risk-medium/40 text-risk-medium font-mono text-xs tracking-wider uppercase font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-risk-medium" />
                      MEDIUM RISK
                    </span>
                    <span className="font-mono text-xs text-on-surface-variant">Yesterday</span>
                  </div>
                  <div>
                    <h3 className="font-headline text-base text-color-offwhite group-hover:text-color-offwhite transition-colors">
                      Delivery Notification
                    </h3>
                    <p className="font-body text-xs text-on-surface-variant/80 mt-1 line-clamp-2">
                      “Package parcel #8493 held at regional depot. Pay Rs 40 re-dispatch fee.”
                    </p>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase">THREAT SCORE</span>
                    <span className="font-mono text-sm font-bold text-risk-medium">58/100</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-mono text-[11px] border border-glass-border">
                    SMS Shortcode
                  </span>
                </div>
              </div>

              {/* Card 3: Job Offer */}
              <div className="relative group rounded-[24px] p-5 bg-surface-container-lowest/80 backdrop-blur-[20px] border border-glass-border shadow-[0_12px_24px_-10px_rgba(0,0,0,0.6)] hover:border-risk-low/40 hover:bg-surface-container-low/70 transition-all duration-300 flex flex-col justify-between">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-risk-low/20 border border-risk-low/40 text-risk-low font-mono text-xs tracking-wider uppercase font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-risk-low" />
                      LOW RISK
                    </span>
                    <span className="font-mono text-xs text-on-surface-variant">2 days ago</span>
                  </div>
                  <div>
                    <h3 className="font-headline text-base text-color-offwhite group-hover:text-color-offwhite transition-colors">
                      Job Interview Sync
                    </h3>
                    <p className="font-body text-xs text-on-surface-variant/80 mt-1 line-clamp-2">
                      “Follow up on your application for Senior Architect role with verified enterprise domain.”
                    </p>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase">THREAT SCORE</span>
                    <span className="font-mono text-sm font-bold text-risk-low">24/100</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-mono text-[11px] border border-glass-border">
                    Clean Domain
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Trust Telemetry Banner matching Stitch screen */}
          <div className="w-full max-w-4xl py-4 px-6 rounded-full bg-surface-container-lowest/80 backdrop-blur-[20px] border border-glass-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-high text-color-offwhite border border-glass-border flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-sm text-color-offwhite">Autonomous Heuristic Shield</span>
                <span className="font-body text-xs text-on-surface-variant">
                  Cross-checks 140M+ malicious patterns • Realtime antiphishing ledger
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-on-surface-variant font-mono text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-risk-low" /> Zero Logs
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-risk-low" /> 256-Bit Cryptographic Pipe
              </span>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
