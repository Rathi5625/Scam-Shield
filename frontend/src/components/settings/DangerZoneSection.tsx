import React, { useState } from 'react';
import {
  AlertOctagon,
  Trash2,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { PurgeAllDataModal } from './PurgeAllDataModal';

interface DangerZoneSectionProps {
  onDeleteScanHistory: () => boolean;
  onPurgeAllData: () => Promise<void>;
  onRefreshInventory: () => void;
}

export const DangerZoneSection: React.FC<DangerZoneSectionProps> = ({
  onDeleteScanHistory,
  onPurgeAllData,
  onRefreshInventory,
}) => {
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [deleteHistoryFeedback, setDeleteHistoryFeedback] = useState<string | null>(null);

  const handleDeleteHistory = () => {
    if (window.confirm('Eradicate all local scan history records? This cannot be undone.')) {
      const success = onDeleteScanHistory();
      if (success) {
        onRefreshInventory();
        setDeleteHistoryFeedback('Scan history archive eradicated completely.');
        setTimeout(() => setDeleteHistoryFeedback(null), 4000);
      }
    }
  };

  const handleConfirmPurgeAll = async () => {
    setIsPurging(true);
    try {
      await onPurgeAllData();
    } finally {
      setIsPurging(false);
      setIsPurgeModalOpen(false);
    }
  };

  return (
    <section id="danger" className="glass-panel p-6 rounded-2xl border border-crimson/40 bg-gradient-to-b from-crimson/10 to-transparent space-y-6 scroll-mt-24">
      <div className="flex items-center justify-between border-b border-crimson/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-crimson/25 border border-crimson/50 text-crimson-light">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-semibold text-color-offwhite tracking-wide">
              Emergency Panic Protocol & Danger Zone
            </h2>
            <p className="text-xs text-crimson-light font-mono">
              High-consequence client-side wipe operations
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-crimson-light bg-crimson/20 border border-crimson/40 px-2.5 py-1 rounded-full uppercase">
          Irreversible Controls
        </span>
      </div>

      {deleteHistoryFeedback && (
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{deleteHistoryFeedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Delete Scan History */}
        <div className="p-4 rounded-xl bg-surface-container-high/60 border border-glass-border flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-color-offwhite font-semibold">
                Delete Scan History
              </h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Clears all historical message, URL, and screenshot verdict records from local storage. Keeps accounts and family circle intact.
            </p>
          </div>

          <button
            onClick={handleDeleteHistory}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-mono transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Scan History</span>
          </button>
        </div>

        {/* Purge All Data (Panic Control) */}
        <div className="p-4 rounded-xl bg-crimson/15 border border-crimson/40 flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-crimson-light animate-pulse" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-color-offwhite font-bold">
                Purge All Data (Panic Wipe)
              </h4>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Total scorched-earth protocol. Eradicates all 6 local storage repositories, clears cached credentials, terminates session, and forces client sign-out.
            </p>
          </div>

          <button
            onClick={() => setIsPurgeModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-crimson hover:bg-crimson/90 text-color-offwhite text-xs font-mono font-bold transition shadow-lg shadow-crimson/30"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>INITIATE PANIC WIPE</span>
          </button>
        </div>
      </div>

      <PurgeAllDataModal
        isOpen={isPurgeModalOpen}
        onClose={() => setIsPurgeModalOpen(false)}
        onConfirmPurge={handleConfirmPurgeAll}
        isPurging={isPurging}
      />
    </section>
  );
};
