import React, { useState } from 'react';
import { X, Mail, Heart, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GlassButton } from '../common/GlassButton';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, relationship: string) => Promise<void>;
  onOpenPendingInvites?: () => void;
  pendingCount?: number;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  onOpenPendingInvites,
  pendingCount = 0,
}) => {
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('Mom');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const relationshipOptions = [
    'Mom',
    'Dad',
    'Spouse / Partner',
    'Child',
    'Brother',
    'Sister',
    'Grandparent',
    'Relative / Friend',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onInvite(email.trim(), relationship);
      setSuccessMessage(`Invitation created for ${email.trim()} (${relationship}).`);
      setEmail('');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-color-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-surface-container-low border border-glass-border p-6 sm:p-8 shadow-2xl text-left">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-on-surface-variant hover:text-color-offwhite hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high w-fit mb-3 border border-glass-border">
          <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-color-offwhite">
            FAMILY PROTECTION
          </span>
        </div>

        <h3 className="font-headline text-2xl text-color-offwhite">Invite Family Member</h3>
        <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
          Add a trusted relative to your shared defense perimeter. They will be able to share suspicious messages and threats with your family group.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-color-crimson/20 border border-color-crimson/40 text-xs font-mono text-rose-600 dark:text-[#ffdad6] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 rounded-xl bg-risk-low/20 border border-risk-low/40 text-xs font-mono text-emerald-700 dark:text-[#a3e635] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="font-mono text-xs text-on-surface-variant block mb-1.5">
              RELATIVE'S EMAIL
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. relative@family.internal"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-glass-border font-body text-sm text-color-offwhite placeholder:text-muted-foreground focus:outline-none focus:border-color-crimson transition-all"
              />
            </div>
          </div>

          <div>
            <label className="font-mono text-xs text-on-surface-variant block mb-1.5">
              RELATIONSHIP / ROLE
            </label>
            <div className="relative">
              <Heart className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-glass-border font-body text-sm text-color-offwhite focus:outline-none focus:border-color-crimson transition-all cursor-pointer"
              >
                {relationshipOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-surface-container-high text-on-surface">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            {pendingCount > 0 && onOpenPendingInvites ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPendingInvites();
                }}
                className="font-mono text-xs text-primary hover:underline cursor-pointer"
              >
                View Pending ({pendingCount})
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-mono text-on-surface-variant hover:text-color-offwhite cursor-pointer"
              >
                Cancel
              </button>
              <GlassButton
                variant="primary"
                size="md"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Send Setup Link'}
              </GlassButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
