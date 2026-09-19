import React from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/common/PageContainer';
import { ShieldAlert, ArrowLeft, Search } from 'lucide-react';
import { GlassButton } from '../components/common/GlassButton';
import { usePageMeta } from '../hooks/usePageMeta';

export const NotFoundPage: React.FC = () => {
  usePageMeta({
    title: '404 — Frequency Not Found | ScamShield',
    description: 'The requested route does not exist or has been quarantined.',
  });

  return (
    <PageContainer maxWidth="lg">
      <div className="min-h-[65vh] flex flex-col items-center justify-center text-center py-16 animate-fadeIn space-y-8">
        {/* Glow ambient overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[320px] bg-color-crimson/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* 404 Sentinel Badge */}
        <div className="w-20 h-20 rounded-3xl bg-surface-container-high/60 border border-glass-border flex items-center justify-center shadow-2xl relative">
          <ShieldAlert className="w-10 h-10 text-primary" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-color-crimson animate-ping" />
        </div>

        <div className="space-y-3 max-w-md">
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
            ERROR 404 // PERIMETER NOT FOUND
          </span>
          <h1 className="font-headline text-3xl sm:text-5xl text-color-offwhite tracking-tight">
            Frequency Not Found
          </h1>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            The endpoint you requested does not exist or has been quarantined by perimeter defenses.
            Return to the command center or launch the unified scanner.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link to="/">
            <GlassButton
              variant="secondary"
              size="md"
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Return to Home
            </GlassButton>
          </Link>

          <Link to="/scan">
            <GlassButton
              variant="primary"
              size="md"
              icon={<Search className="w-4 h-4" />}
            >
              Launch Threat Scanner
            </GlassButton>
          </Link>
        </div>

        <div className="pt-6 font-mono text-[11px] text-on-surface-variant/70 border-t border-glass-border/30 max-w-xs">
          <span>HOST: scam-shield-kohl-phi.vercel.app • STATUS: NOMINAL</span>
        </div>
      </div>
    </PageContainer>
  );
};

export default NotFoundPage;
