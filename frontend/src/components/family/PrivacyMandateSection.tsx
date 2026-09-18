import React from 'react';
import { EyeOff, Sliders, MapPinOff, LogOut, ShieldCheck, Lock } from 'lucide-react';

export const PrivacyMandateSection: React.FC = () => {
  const pillars = [
    {
      icon: <EyeOff className="w-5 h-5 text-primary" />,
      title: 'Zero Message Spying',
      description:
        'Personal chats, photos, and private texts are never read or uploaded. Only anonymized link heuristics and spoof indicators are analyzed.',
    },
    {
      icon: <Sliders className="w-5 h-5 text-tertiary" />,
      title: 'Granular Permissions',
      description:
        'Each member decides which categories of alerts (e.g. financial lookalikes only) are broadcast to the guardian dashboard.',
    },
    {
      icon: <MapPinOff className="w-5 h-5 text-risk-low" />,
      title: 'No Location Tracking',
      description:
        'ScamShield analyzes deceptive cyber vectors, not physical whereabouts. We have zero GPS or geographic telemetry sensors.',
    },
    {
      icon: <LogOut className="w-5 h-5 text-on-surface-variant" />,
      title: 'Immediate Revocation',
      description:
        'Any family member can pause shared alerts or withdraw their device from the circle instantly with one toggle.',
    },
  ];

  return (
    <section className="relative z-10 w-full mt-10">
      <div className="p-6 md:p-10 rounded-2xl bg-surface-container-low/95 backdrop-blur-xl shadow-2xl border border-glass-border relative overflow-hidden text-left">
        {/* Decorative Shield Watermark */}
        <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none text-color-offwhite">
          <ShieldCheck className="w-72 h-72" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="max-w-xl">
            <div className="w-10 h-10 rounded-full bg-risk-low/20 flex items-center justify-center text-risk-low mb-3 border border-risk-low/30">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <h2 className="font-headline text-3xl sm:text-4xl text-color-offwhite tracking-tight">
              Privacy comes first.
            </h2>

            <p className="font-body text-sm sm:text-base text-on-surface-variant mt-2 leading-relaxed">
              Family protection should share only information necessary for collective safety and must always grant members absolute autonomy over their personal data.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono text-xs border border-glass-border">
              <Lock className="w-3.5 h-3.5 text-risk-low" />
              <span>Zero-Knowledge Telemetry • No Body Text Retention</span>
            </div>
          </div>

          {/* 4 Core Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:max-w-2xl">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-surface-container-high/50 hover:bg-surface-container-high transition-colors border border-glass-border/40"
              >
                <div className="flex items-center gap-2.5 text-color-offwhite font-headline text-sm">
                  {pillar.icon}
                  <h4 className="font-semibold">{pillar.title}</h4>
                </div>
                <p className="font-body text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
