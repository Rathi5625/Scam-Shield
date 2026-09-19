import React from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/common/PageContainer';
import {
  Shield,
  MessageSquare,
  Image as ImageIcon,
  Globe,
  ArrowRight,
  Lock,
  Headphones,
  FileCheck,
  AlertTriangle,
  Timer,
  KeyRound,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <PageContainer maxWidth="7xl">
      <div className="flex flex-col w-full text-on-surface">
        {/* Ambient Back-Lighting Glow */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 -left-48 w-96 h-96 bg-color-crimson/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-primary/10 rounded-full blur-[130px]" />
        </div>

        {/* 1. HERO SECTION */}
        <section className="relative w-full pt-8 sm:pt-14 pb-16 flex flex-col items-center justify-center text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[340px] bg-color-crimson/15 rounded-full blur-[130px] pointer-events-none -z-10" />

          {/* Editorial Category Overline */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high/60 border border-glass-border backdrop-blur-md shadow-inner mb-6">
            <span className="w-2 h-2 rounded-full bg-color-crimson animate-pulse" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              Autonomous Threat Intelligence
            </span>
          </div>

          {/* Main Hero Title matching Stitch */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-color-offwhite max-w-4xl tracking-tight mb-5 drop-shadow-sm">
            Think Before You <span className="italic text-crimson-light">Trust</span>.
          </h1>

          {/* Hero Subtitle */}
          <p className="font-sans text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-9 font-normal leading-relaxed">
            ScamShield uses AI to analyze suspicious messages, screenshots, and links — so you can dissect warning signs and act with total confidence.
          </p>

          {/* Action CTA Group (One Clear Primary CTA) */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              to="/scan"
              className="relative group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-primary hover:bg-primary/90 text-color-offwhite font-mono text-sm font-bold shadow-[0_12px_36px_-8px_rgba(139,13,26,0.7)] hover:shadow-[0_16px_44px_-6px_rgba(139,13,26,0.9)] active:scale-95 transition-all cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Scan a Message</span>
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-surface-container-high/40 hover:bg-surface-container-high/80 border border-glass-border text-on-surface-variant hover:text-color-offwhite font-mono text-sm backdrop-blur-md shadow-sm transition-all"
            >
              <span>See How It Works</span>
              <ArrowRight className="w-4 h-4 text-crimson-light" />
            </a>
          </div>

          {/* Interactive Liquid Glass AI Analysis Showcase (Stitch #demo-scanner) */}
          <div className="w-full max-w-4xl mx-auto relative px-2 text-left" id="demo-scanner">
            <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl pointer-events-none -z-10" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Left: Intercepted SMS Card */}
              <div className="lg:col-span-5 rounded-2xl glass-panel p-6 flex flex-col justify-between shadow-[0_18px_40px_rgba(0,0,0,0.6)]">
                <div>
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-glass-border">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-surface-container-high/60 border border-glass-border flex items-center justify-center text-crimson-light">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-mono text-[10px] text-primary uppercase tracking-wider font-semibold">ILLUSTRATIVE EXAMPLE • SMS</div>
                        <div className="font-mono text-xs text-color-offwhite font-semibold">Deception Anatomy Showcase</div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">Demo Breakdown</span>
                  </div>

                  <div className="rounded-xl bg-surface-container-lowest/80 p-4 border border-glass-border shadow-inner mb-4">
                    <p className="font-sans text-xs sm:text-sm text-color-offwhite leading-snug">
                      <span className="font-bold text-rose-400 tracking-wide">[URGENT ALERT]</span> Your banking authentication token will expire in 2 hours. Tap to verify identity &amp; avoid immediate account freeze:
                      <span className="font-mono text-xs block mt-2 text-primary underline underline-offset-4 tracking-tight truncate">
                        https://secure-chase-auth-login.com/id
                      </span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-glass-border flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-color-crimson" />
                    Origin: Spoofed VoIP Gateway
                  </span>
                  <span className="text-muted-foreground/80">Specimen Signature</span>
                </div>
              </div>

              {/* Right: Connected Liquid-Glass AI Analysis Panel */}
              <div className="lg:col-span-7 rounded-2xl glass-panel p-6 sm:p-7 flex flex-col justify-between shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8),0_0_40px_-10px_rgba(139,13,26,0.3)]">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-5 border-b border-glass-border">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-color-crimson text-color-offwhite font-mono text-xs uppercase font-bold shadow-[0_0_18px_rgba(139,13,26,0.8)]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        HIGH RISK
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">Example Detection Model</span>
                    </div>

                    <div className="flex items-baseline gap-1 bg-surface-container-high/60 px-3 py-1 rounded-full border border-glass-border shadow-inner">
                      <span className="font-mono text-sm font-bold text-rose-400">87</span>
                      <span className="font-mono text-[10px] text-muted-foreground">/ 100 Risk Score</span>
                    </div>
                  </div>

                  {/* Threat Breakdown Score Bars */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex justify-between items-center mb-1.5 font-mono text-xs">
                        <span className="text-color-offwhite flex items-center gap-1.5">
                          <Timer className="w-3.5 h-3.5 text-rose-400" />
                          Artificial Urgency (Fear Inducement)
                        </span>
                        <span className="text-rose-400 font-semibold">96% Probability</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-container-high/60 overflow-hidden border border-glass-border">
                        <div className="h-full rounded-full bg-color-crimson w-[96%] shadow-[0_0_12px_rgba(139,13,26,0.9)]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5 font-mono text-xs">
                        <span className="text-color-offwhite flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-rose-400" />
                          Phishing Intent &amp; Token Harvesting
                        </span>
                        <span className="text-rose-400 font-semibold">89% Match</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-container-high/60 overflow-hidden border border-glass-border">
                        <div className="h-full rounded-full bg-color-crimson w-[89%] shadow-[0_0_12px_rgba(139,13,26,0.9)]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5 font-mono text-xs">
                        <span className="text-color-offwhite flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-amber-400" />
                          Domain Newly Registered (&lt;48 Hours)
                        </span>
                        <span className="text-amber-400 font-semibold">Anomalous</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-container-high/60 overflow-hidden border border-glass-border">
                        <div className="h-full rounded-full bg-[#C97A2B] w-[74%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommended Action Glass Box */}
                <div className="rounded-xl bg-primary/20 p-4 border border-primary/30 shadow-[inset_0_1px_1px_rgba(255,148,143,0.2)]">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-crimson-light shrink-0 mt-0.5" />
                    <div>
                      <div className="font-mono text-xs font-bold text-color-offwhite  mb-0.5">
                        Recommended Safeguard
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Do not click or share verification keys. Financial institutions never issue 2-hour expiration demands via generic SMS shortcodes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SCANNER CAPABILITIES GRID (Three Feature Cards) */}
        <section id="protection" className="w-full py-20 relative scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2 font-semibold">
                Multimodal Protection Grid
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-color-offwhite ">
                Three specialized diagnostic engines.
              </h2>
            </div>
            <p className="font-sans text-sm text-muted-foreground max-w-md mt-4 md:mt-0 leading-relaxed">
              Every vector of social engineering analyzed through customized heuristic networks trained on modern deception playbooks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Message Scanner */}
            <Link
              to="/scanner"
              className="group relative rounded-3xl glass-panel p-8 transition-all duration-300 hover:border-primary/40 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-surface-container-high/60 border border-glass-border flex items-center justify-center text-color-offwhite mb-6 group-hover:scale-105 group-hover:bg-primary/30 transition-all">
                  <MessageSquare className="w-7 h-7 text-crimson-light" />
                </div>
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-2 font-semibold">
                  Engine 01 • Natural Language
                </span>
                <h3 className="font-serif text-xl font-bold text-color-offwhite mb-3">
                  Message Scanner
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Analyze suspicious messages, SMS, and messaging app conversations with heuristic intent modeling.
                </p>
              </div>

              <div className="pt-4 bg-surface-container-lowest/60 rounded-xl p-3.5 border border-glass-border shadow-inner">
                <div className="font-mono text-xs text-primary mb-1 flex items-center gap-1.5 font-semibold">
                  <span>Linguistic Telemetry</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Detects emotional pressure, fabricated urgency, and synthetic authority patterns.
                </p>
              </div>
            </Link>

            {/* Card 2: Screenshot Scanner */}
            <Link
              to="/scanner/screenshot"
              className="group relative rounded-3xl glass-panel p-8 transition-all duration-300 hover:border-primary/40 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-surface-container-high/60 border border-glass-border flex items-center justify-center text-color-offwhite mb-6 group-hover:scale-105 group-hover:bg-primary/30 transition-all">
                  <ImageIcon className="w-7 h-7 text-crimson-light" />
                </div>
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-2 font-semibold">
                  Engine 02 • Computer Vision
                </span>
                <h3 className="font-serif text-xl font-bold text-color-offwhite mb-3">
                  Screenshot Scanner
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Upload screenshots and detect warning signs across banking portals, invoices, and fake UI overlays.
                </p>
              </div>

              <div className="pt-4 bg-surface-container-lowest/60 rounded-xl p-3.5 border border-glass-border shadow-inner">
                <div className="font-mono text-xs text-primary mb-1 flex items-center gap-1.5 font-semibold">
                  <span>Deep OCR Verification</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Extracts embedded redirect QR payloads and deceptive pixel-level artifacts.
                </p>
              </div>
            </Link>

            {/* Card 3: Link Shield */}
            <Link
              to="/scanner/link"
              className="group relative rounded-3xl glass-panel p-8 transition-all duration-300 hover:border-primary/40 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-surface-container-high/60 border border-glass-border flex items-center justify-center text-color-offwhite mb-6 group-hover:scale-105 group-hover:bg-primary/30 transition-all">
                  <Globe className="w-7 h-7 text-crimson-light" />
                </div>
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-2 font-semibold">
                  Engine 03 • Sandbox Isolation
                </span>
                <h3 className="font-serif text-xl font-bold text-color-offwhite mb-3">
                  Link Shield
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Analyze suspicious URLs and domains with zero-network static inspection before opening them in your browser.
                </p>
              </div>

              <div className="pt-4 bg-surface-container-lowest/60 rounded-xl p-3.5 border border-glass-border shadow-inner">
                <div className="font-mono text-xs text-primary mb-1 flex items-center gap-1.5 font-semibold">
                  <span>Homograph Defense</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Unmasks lookalike Cyrillic characters, typosquats, and disposable CDN redirect chains.
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* 3. COGNITIVE THREE-STEP FLOW (#how-it-works) */}
        <section className="w-full py-20 relative" id="how-it-works">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-color-offwhite mb-4">
              Don't just detect scams. Understand them.
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Traditional security blindly blocks and warns. ScamShield unpacks the anatomy of the deception in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[18%] right-[18%] h-[2px] bg-gradient-to-r from-transparent via-color-crimson/40 to-transparent -z-10" />

            <div className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-high/60 border border-glass-border flex items-center justify-center font-mono text-base font-bold text-color-offwhite shadow-lg mb-6 group-hover:bg-primary transition-all">
                01
              </div>
              <div className="font-mono text-xs text-primary uppercase tracking-widest mb-1.5 font-semibold">
                Input Ingestion
              </div>
              <h3 className="font-serif text-xl font-bold text-color-offwhite mb-3">
                Paste or Upload
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs">
                Drop raw text, a lookalike URL, or a mobile screenshot directly into the unified scan zone.
              </p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center font-mono text-base font-bold text-color-offwhite shadow-[0_0_24px_rgba(139,13,26,0.6)] mb-6 transition-all">
                02
              </div>
              <div className="font-mono text-xs text-primary uppercase tracking-widest mb-1.5 font-semibold">
                Zero-Day Inspection
              </div>
              <h3 className="font-serif text-xl font-bold text-color-offwhite mb-3">
                AI Analyzes
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs">
                Neural threat models decompose language cues, domain age, and visual signatures in under 1.2 seconds.
              </p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-high/60 border border-glass-border flex items-center justify-center font-mono text-base font-bold text-color-offwhite shadow-lg mb-6 group-hover:bg-primary transition-all">
                03
              </div>
              <div className="font-mono text-xs text-primary uppercase tracking-widest mb-1.5 font-semibold">
                Actionable Clarity
              </div>
              <h3 className="font-serif text-xl font-bold text-color-offwhite mb-3">
                Understand &amp; Act
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs">
                Receive an unambiguous risk tier with plain-English rationales and defensive steps.
              </p>
            </div>
          </div>
        </section>

        {/* 4. TRUST & PRINCIPLES SECTION */}
        <section className="w-full py-16" id="about">
          <div className="rounded-3xl glass-panel p-8 sm:p-14 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-xl mb-12">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest block mb-2 font-semibold">
                Our Operating Ethos
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-color-offwhite mb-4">
                Security should be understandable.
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                We reject fear-mongering and confusing acronyms. ScamShield bridges cybersecurity telemetry with human intuition.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high/60 border border-glass-border flex items-center justify-center text-crimson-light">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-color-offwhite">
                  No Panic, Just Proof
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Transparent breakdown of linguistic manipulation and rogue infrastructure rather than arbitrary black-box risk numbers.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high/60 border border-glass-border flex items-center justify-center text-crimson-light">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-color-offwhite">
                  Zero-Data Retention
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ephemeral scanning ensures your private text snippets, banking statements, and photos are never logged, stored, or trained on.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high/60 border border-glass-border flex items-center justify-center text-crimson-light">
                  <Headphones className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-color-offwhite">
                  Human-First Advisory
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Calm, decisive countermeasure instructions scripted exactly like an empathetic cybersecurity professional sitting next to you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FINAL CALL TO ACTION */}
        <section className="w-full py-20 relative text-center flex flex-col items-center">
          <div className="absolute inset-0 max-w-xl mx-auto bg-color-crimson/15 rounded-full blur-[140px] pointer-events-none -z-10" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high/60 border border-glass-border backdrop-blur-md mb-6">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase font-semibold">
              Immediate Safeguard
            </span>
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-color-offwhite max-w-3xl mb-4 tracking-tight">
            Before you click. Check first.
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mb-9">
            Arm yourself with instant clarity against sophisticated social engineering, cloned brands, and fraudulent messages.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/scan"
              className="relative group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary hover:bg-primary/90 text-color-offwhite font-mono text-sm font-bold shadow-[0_12px_36px_-8px_rgba(139,13,26,0.65)] hover:shadow-[0_14px_42px_-6px_rgba(139,13,26,0.9)] active:scale-95 transition-all"
            >
              <span>Try ScamShield Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="font-mono text-xs text-muted-foreground">
              Instant web access • Sovereign client sandbox
            </span>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="relative z-10 w-full border-t border-glass-border pt-10 pb-8 mt-12 text-xs font-mono">
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="font-serif text-base font-bold text-color-offwhite">
                ScamShield
              </span>
              <span className="font-mono text-[9px] text-muted-foreground px-2 py-0.5 rounded-full bg-surface-container-high/60 border border-glass-border">
                DEFENSE GRID
              </span>
            </div>

            <div className="flex items-center gap-6 flex-wrap justify-center">
              <Link to="/privacy" className="hover:text-color-offwhite transition">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-color-offwhite transition">
                Terms &amp; Conditions
              </Link>
              <Link to="/settings" className="hover:text-color-offwhite transition">
                Security Governance
              </Link>
            </div>

            <div>© 2026 ScamShield. Think before you trust.</div>
          </div>
        </footer>
      </div>
    </PageContainer>
  );
};
