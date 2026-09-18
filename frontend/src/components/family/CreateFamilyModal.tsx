import React, { useState } from 'react';
import { X, Users, Shield, AlertCircle } from 'lucide-react';
import { GlassButton } from '../common/GlassButton';

interface CreateFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (groupName: string) => Promise<void>;
  defaultName?: string;
}

export const CreateFamilyModal: React.FC<CreateFamilyModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  defaultName = 'Sentinel Family Shield',
}) => {
  const [groupName, setGroupName] = useState(defaultName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError('Please provide a name for your family protection group.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onCreate(groupName.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create family group.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-color-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-surface-container-low border border-glass-border p-6 sm:p-8 shadow-2xl text-left">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-on-surface-variant hover:text-color-offwhite hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high w-fit mb-3 border border-glass-border">
          <Users className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-color-offwhite">
            SHARED DEFENSE NETWORK
          </span>
        </div>

        <h3 className="font-headline text-2xl text-color-offwhite">Create Family Protection</h3>
        <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
          Establish a shared defense circle. As the primary Guardian, you will receive synchronized telemetry alerts and can invite up to 5 family members.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-color-crimson/20 border border-color-crimson/40 text-xs font-mono text-rose-600 dark:text-[#ffdad6] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="font-mono text-xs text-on-surface-variant block mb-1.5">
              CIRCLE / GROUP NAME
            </label>
            <div className="relative">
              <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Rathi Family Shield"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-glass-border font-body text-sm text-color-offwhite placeholder:text-muted-foreground focus:outline-none focus:border-color-crimson transition-all"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
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
              {isSubmitting ? 'Establishing Shield...' : 'Establish Family Shield'}
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
};
