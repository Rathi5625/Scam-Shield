import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/common/PageContainer';
import { GlassButton } from '../components/common/GlassButton';
import { LoadingState } from '../components/common/LoadingState';
import { UrlForensicPanel } from '../components/scanner/UrlForensicPanel';
import { scanService } from '../services/scanService';
import {
  historyRepository,
  createRecordFromUrlScan,
} from '../services/history/LocalScanHistoryRepository';
import type { UrlScanResponse } from '../types/api';
import {
  MessageSquare,
  Image as ImageIcon,
  Link as LinkIcon,
  Search,
  X,
  Shield,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

export const LinkShieldPage: React.FC = () => {
  usePageMeta({
    title: 'Link Shield Forensics — ScamShield',
    description: 'Inspect suspicious URLs and domains with zero-network static inspection before opening them in your browser.',
  });

  const [urlInput, setUrlInput] = useState<string>('');
  const [scannedUrl, setScannedUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UrlScanResponse | null>(null);

  const handleScanUrl = async (urlToScan?: string) => {
    const target = (urlToScan || urlInput).trim();
    if (!target) {
      setError('Please enter a valid URL to analyze.');
      return;
    }

    // Basic URL validation check
    try {
      // If protocol missing, prepend https:// for validation parsing
      const urlToValidate = target.startsWith('http://') || target.startsWith('https://')
        ? target
        : `https://${target}`;
      new URL(urlToValidate);
    } catch {
      setError('Invalid URL format. Please include a standard domain (e.g., example.com).');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setScannedUrl(target);

    try {
      const response = await scanService.scanUrl(target);
      setResult(response);

      // Auto-save to local history vault
      try {
        const record = createRecordFromUrlScan(response, target);
        await historyRepository.saveScan(record);
      } catch {
        // Non-blocking: never disrupt the result presentation
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to inspect URL. The heuristic engine may be offline.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUrlInput('');
    setScannedUrl('');
    setResult(null);
    setError(null);
  };


  return (
    <PageContainer maxWidth="7xl">
      {/* If result is available, display forensic inspection console */}
      {result && !loading && (
        <UrlForensicPanel
          url={scannedUrl}
          result={result}
          onReset={handleReset}
        />
      )}

      {/* Main Intake Console */}
      {!result && (
        <div className="flex flex-col items-center space-y-10">
          {/* Eyebrow Header matching Stitch screen 78aa6010... */}
          <div className="flex flex-col items-center text-center space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest/80 border border-glass-border shadow-sm backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-color-crimson opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-color-crimson" />
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">
                LINK SHIELD • FORENSIC URL INSPECTOR
              </span>
            </div>

            <h1 className="font-headline text-4xl sm:text-6xl text-color-offwhite tracking-tight">
              Before you click, check the link.
            </h1>

            <p className="font-body text-base sm:text-lg text-on-surface-variant max-w-xl font-normal leading-relaxed">
              Detect deceptive domains, punycode lookalikes, URL shorteners, and credential harvesting traps before your browser resolves them.
            </p>

            {/* Sub-navigation Switcher Pill */}
            <div className="flex items-center p-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-2xl border border-glass-border shadow-lg mt-2">
              <Link
                to="/scan"
                className="px-4 py-1.5 rounded-full font-mono text-xs text-on-surface-variant hover:text-color-offwhite transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Paste Message</span>
              </Link>

              <Link
                to="/scanner/screenshot"
                className="px-4 py-1.5 rounded-full font-mono text-xs text-on-surface-variant hover:text-color-offwhite transition-colors flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Upload Screenshot</span>
              </Link>

              <button
                type="button"
                className="px-4 py-1.5 rounded-full font-mono text-xs text-color-offwhite bg-surface-container-high border border-color-crimson/50 shadow-crimson-glow flex items-center gap-1.5 cursor-default"
              >
                <LinkIcon className="w-3.5 h-3.5 text-color-crimson" />
                <span>Analyze Link</span>
              </button>
            </div>
          </div>

          {/* Diagnostic Status Indicator Bar */}
          <div className="w-full max-w-3xl flex items-center justify-between text-xs font-mono text-on-surface-variant px-2">
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-wider">FORENSIC ENGINE:</span>
              <span className="text-color-offwhite font-medium">STATIC_LEXICAL_HEURISTICS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-risk-low animate-pulse" />
              <span>ACTIVE DEFENSE</span>
            </div>
          </div>

          {/* Central Input Box */}
          <div className="w-full max-w-3xl rounded-[28px] p-6 sm:p-8 bg-surface-container-lowest/80 backdrop-blur-[28px] border border-glass-border shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(245,242,237,0.12)] relative transition-all duration-300">
            {/* Top Hairline Highlight */}
            <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-color-offwhite/25 to-transparent" />

            {loading ? (
              <div className="py-12">
                <LoadingState message="Conducting static lexical inspection..." />
                <p className="font-mono text-xs text-center text-on-surface-variant mt-4">
                  Zero Network Dispatch • Static Lexical Forensics Only
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleScanUrl();
                  }}
                  className="space-y-4"
                >
                  <label
                    htmlFor="url-scanner-input"
                    className="block font-mono text-xs uppercase tracking-wider text-on-surface-variant"
                  >
                    Target URL or Domain String
                  </label>

                  <div className="relative flex items-center rounded-2xl bg-surface-container-lowest/90 border border-border-subtle focus-within:border-glass-border focus-within:ring-1 focus-within:ring-color-offwhite/20 transition-all p-2 shadow-inner">
                    <div className="pl-3 pr-2 flex items-center pointer-events-none text-on-surface-variant/70">
                      <Search className="w-5 h-5 text-on-surface-variant" />
                    </div>

                    <input
                      id="url-scanner-input"
                      type="text"
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value);
                        setError(null);
                      }}
                      placeholder="https://example.com/suspicious-path or domain.com"
                      className="w-full bg-transparent border-0 font-mono text-sm sm:text-base text-color-offwhite placeholder:text-on-surface-variant/40 focus:ring-0 focus:outline-none py-2.5 px-2"
                      autoComplete="off"
                      spellCheck="false"
                      aria-label="URL input to inspect"
                    />

                    {urlInput && (
                      <button
                        type="button"
                        onClick={() => setUrlInput('')}
                        className="p-2 text-on-surface-variant hover:text-color-offwhite transition-colors cursor-pointer mr-1"
                        aria-label="Clear URL input"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    <GlassButton
                      type="submit"
                      variant="primary"
                      disabled={!urlInput.trim()}
                      className="shrink-0 h-11 px-5"
                    >
                      <span>Analyze</span>
                      <ArrowRight className="w-4 h-4" />
                    </GlassButton>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-color-crimson/20 border border-color-crimson/40 text-primary text-xs font-mono"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 text-color-crimson" />
                      <span>{error}</span>
                    </div>
                  )}
                </form>

                {/* Security Guarantee Notice */}
                <div className="p-4 rounded-xl bg-surface-container-lowest/60 border border-glass-border/40 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-risk-low shrink-0 mt-0.5" />
                  <div className="text-xs font-mono text-on-surface-variant space-y-1">
                    <p className="text-color-offwhite font-medium">
                      Zero Outbound Request Guarantee
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      Link Shield NEVER makes HTTP/HTTPS requests to the target URL, never resolves DNS, never crawls pages, and never downloads remote assets. All inspection is strictly mathematical and lexical on the input string.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default LinkShieldPage;
