import React, { useState } from 'react';
import type { UserProfile } from '../../types/auth';
import {
  ShieldCheck,
  CheckCircle,
  Edit2,
  LogOut,
  Save,
  X,
} from 'lucide-react';

interface AccountSectionProps {
  user: UserProfile | null;
  onUpdateProfile: (data: { displayName?: string }) => Promise<void>;
  onSignOut: () => void;
}

export const AccountSection: React.FC<AccountSectionProps> = ({
  user,
  onUpdateProfile,
  onSignOut,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const initials = (user?.displayName || user?.email || 'AV')
    .split(/[@\s]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    try {
      setIsSaving(true);
      await onUpdateProfile({ displayName: displayName.trim() });
      setIsEditing(false);
      setFeedback('Profile successfully updated.');
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback('Failed to update profile.');
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      id="account-section"
      className="relative rounded-3xl bg-surface-dark p-6 sm:p-8 md:p-10 shadow-[0_12px_36px_-8px_rgba(0,0,0,0.6),inset_0_1px_1px_0_rgba(245,242,237,0.1)] border border-glass-border/40 overflow-hidden scroll-mt-28"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h2 className="font-headline text-2xl sm:text-3xl text-color-offwhite">
            Account
          </h2>
        </div>
        <span className="font-mono text-xs px-3 py-1 rounded-full bg-surface-container-high text-secondary uppercase tracking-widest">
          Primary Guardian
        </span>
      </div>

      {feedback && (
        <div className="mb-6 p-3 rounded-xl bg-surface-container-high/60 border border-glass-border text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-2xl bg-surface-container/70 shadow-[inset_0_1px_0_0_rgba(245,242,237,0.08)] mb-6 border border-glass-border/30">
        <div className="flex items-center gap-5">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-primary/20 border border-primary/40 flex items-center justify-center text-color-offwhite text-lg font-mono font-bold shadow-[0_0_24px_rgba(139,13,26,0.3)] shrink-0">
            {initials}
            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-title text-lg font-semibold text-color-offwhite">
                {user?.displayName || 'Alex Vance'}
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-risk-low/15 text-risk-low font-mono text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-risk-low" />
                Vigilant Active
              </span>
            </div>
            <p className="font-body text-sm text-secondary mt-0.5">
              Primary Account Guardian • Lead Inspector
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 rounded-full bg-surface-bright hover:bg-surface-container-highest text-color-offwhite font-body text-sm transition-all shadow-[inset_0_1px_0_0_rgba(245,242,237,0.15)] flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
          <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      {/* In-Card Profile Edit Form */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="mb-6 p-5 rounded-2xl bg-surface-container-lowest border border-glass-border/50 space-y-3">
          <label className="block font-mono text-xs uppercase tracking-wider text-secondary">
            Update Callsign / Display Name
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Vance"
              required
              className="flex-1 bg-surface-container border border-glass-border rounded-xl px-4 py-2 text-sm text-color-offwhite font-mono focus:outline-none focus:border-primary transition"
            />
            <button
              type="submit"
              disabled={isSaving || !displayName.trim()}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-color-offwhite font-mono text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-2 rounded-xl text-secondary hover:text-color-offwhite transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Account Details Grid */}
      <div className="space-y-4">
        {/* Email Item */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-low border border-glass-border/30">
          <div>
            <span className="font-mono text-[11px] text-secondary uppercase tracking-wider block mb-1">
              Primary Email
            </span>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm text-color-offwhite">
                {user?.email || 'alex.vance@defense.internal'}
              </span>
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-risk-low/20 text-risk-low font-medium">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const newEmail = window.prompt('Enter updated operative email address:', user?.email || '');
              if (newEmail && newEmail.includes('@')) {
                setFeedback(`Email verification dispatched to ${newEmail}.`);
                setTimeout(() => setFeedback(null), 4000);
              }
            }}
            className="self-start sm:self-center px-4 py-1.5 rounded-full bg-surface-container-high/80 hover:bg-surface-bright text-color-offwhite font-body text-sm transition-all shadow-[inset_0_1px_0_0_rgba(245,242,237,0.1)] cursor-pointer"
          >
            Change Email
          </button>
        </div>

        {/* Password Item */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-low border border-glass-border/30">
          <div>
            <span className="font-mono text-[11px] text-secondary uppercase tracking-wider block mb-1">
              Password Credentials
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-color-offwhite tracking-widest">
                ••••••••••••••••
              </span>
              <span className="font-body text-xs text-on-surface-variant">
                Last modified 42 days ago
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              window.alert('Local Sovereign Mode: Cryptographic password hash is secured in browser memory. Remote password rotation will link with AWS Cognito in Phase 9.');
            }}
            className="self-start sm:self-center px-4 py-1.5 rounded-full bg-surface-container-high/80 hover:bg-surface-bright text-color-offwhite font-body text-sm transition-all shadow-[inset_0_1px_0_0_rgba(245,242,237,0.1)] cursor-pointer"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Sign Out Action */}
      <div className="mt-6 pt-6 flex justify-end">
        <button
          type="button"
          onClick={onSignOut}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-surface-container-high hover:bg-surface-bright text-color-offwhite font-body text-sm transition-all shadow-[inset_0_1px_0_0_rgba(245,242,237,0.1)] cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-secondary" />
          <span>Sign Out from Device</span>
        </button>
      </div>
    </section>
  );
};
