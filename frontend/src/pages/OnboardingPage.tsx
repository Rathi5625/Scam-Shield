import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageContainer } from '../components/common/PageContainer';
import { GlassToggle } from '../components/common/GlassToggle';
import type { UserPreferences } from '../types/auth';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Eye,
  ArrowRight,
  Sparkles,
  Users,
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { user, completeOnboarding, isLoading } = useAuth();
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState<UserPreferences>({
    aggressivePhishingShield: true,
    realtimeHeuristics: true,
    familyAlerts: true,
    ephemeralLogging: true,
  });

  const [step, setStep] = useState<1 | 2>(1);

  const handleToggle = (key: keyof UserPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCompleteSetup = async () => {
    try {
      await completeOnboarding(preferences);
      navigate('/scanner', { replace: true });
    } catch {
      // Navigate to scanner anyway in mock mode
      navigate('/scanner', { replace: true });
    }
  };

  return (
    <PageContainer maxWidth="7xl">
      <div className="py-8 animate-fadeIn min-h-[calc(100vh-10rem)] flex items-center justify-center">
        {/* Background Radial Atmosphere */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] bg-color-crimson/15 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* Main Bento Composition matching Stitch Screen f47a66b8... */}
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-12 relative z-10">
          {/* Left Pillar: Threat Mitigation Vectors (Desktop) */}
          <div className="hidden lg:flex flex-col justify-between w-80 pt-4 shrink-0 space-y-8 select-none">
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="w-1.5 h-1.5 rounded-full bg-color-crimson" />
                <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">
                  Threat Mitigation Vector
                </span>
              </div>
              <p className="font-headline text-2xl text-color-offwhite leading-tight">
                Autonomous Personal Defense.
              </p>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                Deploy real-time cryptographic screening against impersonation, spear phishing, and spoofed routing.
              </p>
            </div>

            {/* Triad Badges: CHECK • UNDERSTAND • PROTECT */}
            <div className="flex flex-col gap-3 relative text-left">
              <div className="absolute left-4 top-4 bottom-4 w-px bg-surface-container-high -z-0" />

              {/* Node 1: CHECK */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-low/70 backdrop-blur-xl border border-glass-border">
                <div className="w-7 h-7 rounded-full bg-surface-dark flex items-center justify-center text-risk-low shrink-0 mt-0.5 border border-glass-border font-mono text-xs font-bold">
                  01
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-color-offwhite uppercase">
                      Check
                    </span>
                    <span className="font-mono text-[9px] text-risk-low bg-surface-dark px-1.5 py-0.5 rounded border border-risk-low/30">
                      Neural L1
                    </span>
                  </div>
                  <span className="font-body text-[11px] text-on-surface-variant mt-0.5">
                    Real-time heuristic scan &amp; token verification.
                  </span>
                </div>
              </div>

              {/* Node 2: UNDERSTAND */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-low/70 backdrop-blur-xl border border-glass-border">
                <div className="w-7 h-7 rounded-full bg-surface-dark flex items-center justify-center text-risk-medium shrink-0 mt-0.5 border border-glass-border font-mono text-xs font-bold">
                  02
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-color-offwhite uppercase">
                      Understand
                    </span>
                    <span className="font-mono text-[9px] text-risk-medium bg-surface-dark px-1.5 py-0.5 rounded border border-risk-medium/30">
                      NLP Lex
                    </span>
                  </div>
                  <span className="font-body text-[11px] text-on-surface-variant mt-0.5">
                    Deceptive intent, homograph spoofing, &amp; urgency breakdown.
                  </span>
                </div>
              </div>

              {/* Node 3: PROTECT */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-low/70 backdrop-blur-xl border border-glass-border">
                <div className="w-7 h-7 rounded-full bg-surface-dark flex items-center justify-center text-color-crimson shrink-0 mt-0.5 border border-glass-border font-mono text-xs font-bold">
                  03
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-color-offwhite uppercase">
                      Protect
                    </span>
                    <span className="font-mono text-[9px] text-primary bg-surface-dark px-1.5 py-0.5 rounded border border-color-crimson/30">
                      Zero-Trust
                    </span>
                  </div>
                  <span className="font-body text-[11px] text-on-surface-variant mt-0.5">
                    Autonomous interception across message endpoints.
                  </span>
                </div>
              </div>
            </div>

            {/* Mesh Status */}
            <div className="p-3.5 rounded-xl bg-surface-dark/90 backdrop-blur-md border border-glass-border flex flex-col gap-1.5 text-left">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-on-surface-variant uppercase">Threat Mesh Sync</span>
                <span className="text-risk-low flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-ping" />
                  SYNCHRONIZED
                </span>
              </div>
              <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-risk-low to-tertiary-fixed-dim h-full w-[94%]" />
              </div>
              <span className="font-mono text-[10px] text-on-surface-variant/70">
                LOCAL NODE ENFORCED
              </span>
            </div>
          </div>

          {/* Center: Shield Configuration Card */}
          <div className="w-full max-w-xl relative">
            <div className="relative rounded-3xl bg-[#121212]/85 backdrop-blur-2xl p-7 sm:p-10 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.85)] border border-glass-border overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-color-offwhite/25 to-transparent" />

              {/* Emblem & Title */}
              <div className="flex flex-col items-center text-center space-y-3 mb-8">
                <div className="w-14 h-14 rounded-full bg-surface-dark flex items-center justify-center border border-glass-border shadow-inner relative">
                  <div className="absolute inset-0 rounded-full bg-color-crimson/20 blur-md" />
                  <Shield className="w-7 h-7 text-color-offwhite relative z-10" />
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-dark border border-glass-border shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-pulse" />
                  <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">
                    Node Setup • Phase 1
                  </span>
                </div>

                <h1 className="font-headline text-3xl sm:text-4xl text-color-offwhite tracking-tight">
                  {step === 1 ? 'Configure Shield Profile' : 'Shield Deployment Ready'}
                </h1>

                <p className="font-body text-sm text-on-surface-variant max-w-md mx-auto">
                  {step === 1
                    ? `Welcome, ${user?.displayName || 'Operative'}. Tune your automated threat detection parameters.`
                    : 'Your local security vault is sealed. Review active security modules.'}
                </p>
              </div>

              {step === 1 ? (
                /* Step 1: Preferences Selection */
                <div className="space-y-4 text-left">
                  {/* Aggressive Phishing Shield */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low/80 border border-glass-border hover:border-glass-border/80 transition-all">
                    <div className="flex items-start gap-3.5 pr-4">
                      <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0 mt-0.5 border border-glass-border">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-headline text-sm text-color-offwhite block">
                          Aggressive Phishing Interception
                        </span>
                        <p className="font-body text-xs text-on-surface-variant">
                          Flags lookalike domains, punycode spoofing, and zero-day banking gateways.
                        </p>
                      </div>
                    </div>
                    <GlassToggle
                      checked={preferences.aggressivePhishingShield}
                      onChange={() => handleToggle('aggressivePhishingShield')}
                    />
                  </div>

                  {/* Realtime OCR Heuristics */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low/80 border border-glass-border hover:border-glass-border/80 transition-all">
                    <div className="flex items-start gap-3.5 pr-4">
                      <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0 mt-0.5 border border-glass-border">
                        <Eye className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-headline text-sm text-color-offwhite block">
                          Optical Screenshot Scanner
                        </span>
                        <p className="font-body text-xs text-on-surface-variant">
                          Analyzes visual typography, urgency patterns, and spoofed bank emblems.
                        </p>
                      </div>
                    </div>
                    <GlassToggle
                      checked={preferences.realtimeHeuristics}
                      onChange={() => handleToggle('realtimeHeuristics')}
                    />
                  </div>

                  {/* Family Alerts */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low/80 border border-glass-border hover:border-glass-border/80 transition-all">
                    <div className="flex items-start gap-3.5 pr-4">
                      <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0 mt-0.5 border border-glass-border">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-headline text-sm text-color-offwhite block">
                          Family Circle Broadcasts
                        </span>
                        <p className="font-body text-xs text-on-surface-variant">
                          Prepares emergency incident broadcasts for registered family members.
                        </p>
                      </div>
                    </div>
                    <GlassToggle
                      checked={preferences.familyAlerts}
                      onChange={() => handleToggle('familyAlerts')}
                    />
                  </div>

                  {/* Ephemeral Privacy */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low/80 border border-glass-border hover:border-glass-border/80 transition-all">
                    <div className="flex items-start gap-3.5 pr-4">
                      <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-risk-low shrink-0 mt-0.5 border border-glass-border">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-headline text-sm text-color-offwhite block">
                          Zero-PII Storage Policy
                        </span>
                        <p className="font-body text-xs text-on-surface-variant">
                          Strictly redacts OTPs, card numbers, and raw image binaries from local logs.
                        </p>
                      </div>
                    </div>
                    <GlassToggle
                      checked={preferences.ephemeralLogging}
                      onChange={() => handleToggle('ephemeralLogging')}
                    />
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full py-3.5 rounded-full bg-gradient-to-r from-color-crimson via-[#8e101c] to-color-crimson text-color-offwhite font-headline text-base tracking-wide shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Review &amp; Deploy Shield</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 2: Deployment Confirmation */
                <div className="space-y-6 text-left animate-fadeIn">
                  <div className="p-5 rounded-2xl bg-surface-container-low/80 border border-glass-border space-y-3">
                    <div className="flex items-center justify-between border-b border-glass-border/50 pb-3">
                      <span className="font-mono text-xs text-on-surface-variant uppercase">Operative Callsign</span>
                      <span className="font-headline text-sm text-color-offwhite">{user?.displayName}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-glass-border/50 pb-3">
                      <span className="font-mono text-xs text-on-surface-variant uppercase">Encrypted Email</span>
                      <span className="font-mono text-xs text-color-offwhite">{user?.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-on-surface-variant uppercase">Active Perimeter</span>
                      <span className="font-mono text-xs text-risk-low flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        4 Modules Active
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-risk-low/10 border border-risk-low/30 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-risk-low shrink-0 mt-0.5" />
                    <div className="text-xs font-body text-on-surface-variant space-y-1">
                      <p className="text-color-offwhite font-medium">Local Mock Vault Initialized</p>
                      <p className="text-[11px] leading-relaxed">
                        Your defensive parameters are saved to your browser session. You are now prepared to scan suspicious messages, screenshots, and links.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-3 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant font-mono text-xs transition-colors cursor-pointer border border-glass-border"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleCompleteSetup}
                      disabled={isLoading}
                      className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-color-crimson via-[#8e101c] to-color-crimson text-color-offwhite font-headline text-base tracking-wide shadow-[0_12px_28px_-6px_rgba(139,13,26,0.6)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isLoading ? 'Activating Node...' : 'Launch ScamShield Defense'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default OnboardingPage;
