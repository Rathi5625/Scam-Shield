import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { UserPreferences } from '../../types/auth';
import type { FamilyMember } from '../../types/family';
import { Users } from 'lucide-react';
import { familyRepository } from '../../services/family/LocalFamilyProtectionRepository';
import { useAuth } from '../../context/AuthContext';

interface FamilyPreferencesSectionProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
}

export const FamilyPreferencesSection: React.FC<FamilyPreferencesSectionProps> = ({
  preferences,
  onUpdatePreferences,
}) => {
  const { user } = useAuth();
  const [memberCount, setMemberCount] = useState(4);
  const [memberNames, setMemberNames] = useState('Mom, Dad, Lucas');

  useEffect(() => {
    let isMounted = true;
    const loadGroup = async () => {
      try {
        const userId = user?.id || 'usr_demo_sentinel';
        const group = await familyRepository.getFamilyGroup(userId);
        if (isMounted && group && group.members.length > 0) {
          setMemberCount(group.members.length);
          const others = group.members.filter((m: FamilyMember) => m.role !== 'OWNER');
          if (others.length > 0) {
            setMemberNames(others.map((m: FamilyMember) => m.displayName || m.relationship || 'Ward').join(', '));
          }
        }
      } catch {
        // fallback safe values
      }
    };
    loadGroup();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleToggleFamilyAlerts = async () => {
    await onUpdatePreferences({
      familyAlerts: !preferences.familyAlerts,
    });
  };

  const handleTogglePhishingShield = async () => {
    await onUpdatePreferences({
      aggressivePhishingShield: !preferences.aggressivePhishingShield,
    });
  };

  return (
    <section
      id="family-section"
      className="relative rounded-3xl bg-surface-dark p-6 sm:p-8 md:p-10 shadow-[0_12px_36px_-8px_rgba(0,0,0,0.6),inset_0_1px_1px_0_rgba(245,242,237,0.1)] border border-glass-border/40 overflow-hidden scroll-mt-28"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="font-headline text-2xl sm:text-3xl text-color-offwhite">
              Family Protection
            </h2>
          </div>
          <p className="font-body text-sm text-secondary mt-1">
            Cross-guardian relay rules and instant scam interception thresholds.
          </p>
        </div>
        <span className="font-mono text-xs px-3.5 py-1.5 rounded-full bg-surface-container-high text-secondary shrink-0">
          {memberCount} of 5 Seats Active
        </span>
      </div>

      <div className="space-y-5">
        {/* Member Overview Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-surface-container/60 shadow-[inset_0_1px_0_0_rgba(245,242,237,0.06)] border border-glass-border/30">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-surface-dark flex items-center justify-center text-xs font-mono font-bold text-color-offwhite shadow-sm">
                M
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-500/20 border-2 border-surface-dark flex items-center justify-center text-xs font-mono font-bold text-purple-300 shadow-sm">
                D
              </div>
              <div className="w-10 h-10 rounded-full bg-sky-500/20 border-2 border-surface-dark flex items-center justify-center text-xs font-mono font-bold text-sky-300 shadow-sm">
                L
              </div>
            </div>
            <div>
              <span className="font-title text-base font-semibold text-color-offwhite block">
                Protected Ward: {memberNames}
              </span>
              <span className="font-body text-xs text-on-surface-variant">
                Real-time heuristics enabled on 6 mobile nodes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/family-protection"
              className="font-body text-sm text-primary hover:text-color-offwhite transition-colors underline-offset-4 hover:underline"
            >
              Open Family Hub
            </Link>
            <Link
              to="/family-protection"
              className="px-4 py-1.5 rounded-full bg-surface-bright hover:bg-surface-container-highest text-color-offwhite font-body text-sm transition-all shadow-[inset_0_1px_0_0_rgba(245,242,237,0.12)]"
            >
              Manage Permissions
            </Link>
          </div>
        </div>

        {/* Toggle: Instant SMS Alerts */}
        <div className="flex items-start justify-between gap-6 p-5 rounded-2xl bg-surface-container/60 shadow-[inset_0_1px_0_0_rgba(245,242,237,0.06)] border border-glass-border/30">
          <div>
            <span className="font-title text-base font-semibold text-color-offwhite block">
              Instant SMS Alerts on High-Risk Detections
            </span>
            <p className="font-body text-xs text-secondary mt-1">
              Dispatches emergency bypass notifications when spoofed banking links are opened by any family member.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={preferences.familyAlerts}
              onChange={handleToggleFamilyAlerts}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-risk-high after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-color-offwhite after:rounded-full after:h-[18px] after:w-[18px] after:transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]" />
          </label>
        </div>

        {/* Toggle: Broadcast Deceptive Domain Warnings */}
        <div className="flex items-start justify-between gap-6 p-5 rounded-2xl bg-surface-container/60 shadow-[inset_0_1px_0_0_rgba(245,242,237,0.06)] border border-glass-border/30">
          <div>
            <span className="font-title text-base font-semibold text-color-offwhite block">
              Broadcast Deceptive Domain Warnings to Guardians
            </span>
            <p className="font-body text-xs text-secondary mt-1">
              Synchronizes blacklisted threat telemetry silently between your trusted account perimeter.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={preferences.aggressivePhishingShield}
              onChange={handleTogglePhishingShield}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-risk-high after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-color-offwhite after:rounded-full after:h-[18px] after:w-[18px] after:transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]" />
          </label>
        </div>
      </div>
    </section>
  );
};
