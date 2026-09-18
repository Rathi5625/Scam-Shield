import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  X,
} from 'lucide-react';

interface PurgeAllDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPurge: () => void;
  isPurging: boolean;
}

export const PurgeAllDataModal: React.FC<PurgeAllDataModalProps> = ({
  isOpen,
  onClose,
  onConfirmPurge,
  isPurging,
}) => {
  const [confirmationPhrase, setConfirmationPhrase] = useState('');
  const REQUIRED_PHRASE = 'PURGE ALL';

  if (!isOpen) return null;

  const isMatched = confirmationPhrase.trim().toUpperCase() === REQUIRED_PHRASE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel p-6 rounded-2xl border border-crimson/50 shadow-2xl shadow-crimson/25 space-y-5 bg-surface-container-lowest/95">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-crimson/25 border border-crimson/50 text-crimson-light">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-color-offwhite tracking-wide">
                Emergency Panic Wipe Protocol
              </h3>
              <p className="text-xs text-crimson-light font-mono">
                CRITICAL IRREVERSIBLE OPERATION
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPurging}
            className="p-1 rounded-lg text-muted-foreground hover:text-color-offwhite hover:bg-surface-container-high/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Body */}
        <div className="p-4 rounded-xl bg-crimson/15 border border-crimson/30 space-y-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-crimson-light font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>ALL LOCAL TERMINAL DATA WILL BE DESTROYED</span>
          </div>
          <p className="text-on-surface-variant leading-relaxed">
            Executing this protocol will permanently eradicate all 6 local storage repositories:
          </p>
          <ul className="list-disc list-inside text-[11px] text-muted-foreground space-y-1 pl-1">
            <li>User credential vaults & passwords (<code className="text-crimson-light">scamshield_users_db</code>)</li>
            <li>Active authenticated session (<code className="text-crimson-light">scamshield_session_user</code>)</li>
            <li>Complete scan history archive (<code className="text-crimson-light">scamshield_scan_history_v1</code>)</li>
            <li>Family defense groups & members (<code className="text-crimson-light">scamshield_family_groups_v1</code>)</li>
            <li>Pending invitations (<code className="text-crimson-light">scamshield_family_invites_v1</code>)</li>
            <li>Shared syndicate threat logs (<code className="text-crimson-light">scamshield_family_threats_v1</code>)</li>
          </ul>
        </div>

        {/* Confirmation Input */}
        <div className="space-y-2">
          <label className="block text-xs font-mono text-on-surface-variant">
            Type <span className="font-bold text-crimson-light tracking-wider">PURGE ALL</span> below to confirm eradication:
          </label>
          <input
            type="text"
            value={confirmationPhrase}
            onChange={(e) => setConfirmationPhrase(e.target.value)}
            disabled={isPurging}
            placeholder="Type PURGE ALL"
            className="w-full bg-surface-container-high/70 border border-crimson/30 rounded-lg px-3.5 py-2.5 text-sm text-on-surface font-mono placeholder:text-muted-foreground focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson transition uppercase"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPurging}
            className="px-4 py-2 rounded-lg border border-glass-border hover:bg-surface-container-high/40 text-xs font-mono text-on-surface-variant transition"
          >
            Abort Protocol
          </button>

          <button
            type="button"
            onClick={onConfirmPurge}
            disabled={!isMatched || isPurging}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-crimson hover:bg-crimson/90 text-color-offwhite text-xs font-mono font-bold transition disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-crimson/40"
          >
            {isPurging ? (
              <span>Eradicating Terminal...</span>
            ) : (
              <>
                <Flame className="w-4 h-4" />
                <span>CONFIRM PANIC WIPE</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
