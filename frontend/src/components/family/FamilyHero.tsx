import React from 'react';
import { UserPlus, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { FamilyMember } from '../../types/family';

interface FamilyHeroProps {
  members: FamilyMember[];
  isLockdownActive: boolean;
  onInviteClick: () => void;
  onLockdownClick: () => void;
}

export const FamilyHero: React.FC<FamilyHeroProps> = ({
  members,
  isLockdownActive,
  onInviteClick,
  onLockdownClick,
}) => {
  const activeMembers = members.filter((m) => m.status === 'ACTIVE');

  return (
    <section className="relative z-10 w-full pt-4 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="flex flex-col max-w-2xl text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-high/60 backdrop-blur-xl w-fit mb-4 border border-glass-border">
          <span className={`w-2 h-2 rounded-full ${isLockdownActive ? 'bg-color-crimson animate-ping' : 'bg-risk-low animate-ping'}`} />
          <span className={`w-2 h-2 rounded-full ${isLockdownActive ? 'bg-color-crimson' : 'bg-risk-low'} -ml-3`} />
          <span className="font-mono text-[11px] text-color-offwhite uppercase tracking-widest font-semibold">
            Shared Defense Network • Family Plan
          </span>
        </div>

        <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl text-color-offwhite tracking-tight leading-tight">
          Protect the people <br className="hidden sm:inline" />
          <span className="italic font-normal text-crimson-light">you care about.</span>
        </h1>

        <p className="font-body text-base sm:text-lg text-on-surface-variant mt-3 max-w-xl leading-relaxed">
          Help your family recognize predatory scams, lookalike portals, and spoofed prompts before they become irreversible mistakes.
        </p>
      </div>

      {/* Quick Action & Guardian Cluster */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-surface-container-low/80 backdrop-blur-xl border border-glass-border shadow-md">
          <div className="flex -space-x-2">
            {activeMembers.slice(0, 3).map((m) => (
              <div
                key={m.id}
                className="w-7 h-7 rounded-full bg-surface-container-highest border border-glass-border flex items-center justify-center text-color-offwhite font-mono text-[10px] font-semibold"
                title={m.displayName}
              >
                {m.avatarUrl ? (
                  <img src={m.avatarUrl} alt={m.displayName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  m.displayName.slice(0, 2).toUpperCase()
                )}
              </div>
            ))}
            {activeMembers.length > 3 && (
              <div className="w-7 h-7 rounded-full bg-surface-container-high border border-glass-border flex items-center justify-center text-primary font-mono text-[10px]">
                +{activeMembers.length - 3}
              </div>
            )}
          </div>
          <div className="flex flex-col text-left">
            <span className="font-headline text-xs text-color-offwhite leading-tight">
              {activeMembers.length} Guardians Active
            </span>
            <span
              className={`font-mono text-[10px] tracking-wider uppercase font-semibold ${
                isLockdownActive ? 'text-color-crimson animate-pulse' : 'text-risk-low'
              }`}
            >
              {isLockdownActive ? 'LOCKDOWN ENGAGED' : 'SYNC NOMINAL'}
            </span>
          </div>
        </div>

        <button
          onClick={onInviteClick}
          type="button"
          className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container-high hover:bg-surface-variant text-color-offwhite font-body text-sm transition-all border border-glass-border shadow-md cursor-pointer hover:border-glass-border/80"
        >
          <UserPlus className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
          <span>Invite Member</span>
        </button>

        <button
          onClick={onLockdownClick}
          type="button"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all shadow-md cursor-pointer border ${
            isLockdownActive
              ? 'bg-color-crimson/30 text-color-offwhite border-color-crimson hover:bg-color-crimson/50'
              : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-color-offwhite border-glass-border'
          }`}
        >
          {isLockdownActive ? (
            <>
              <ShieldAlert className="w-4 h-4 text-color-crimson animate-bounce" />
              <span>Deactivate Lockdown</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Emergency Lockdown</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
};
