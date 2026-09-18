import React, { useState } from 'react';
import type { UserPreferences } from '../../types/auth';
import type { StorageInventory } from '../../services/data/DataManagementService';
import {
  Shield,
  Clock,
  Database,
  Trash2,
  AlertTriangle,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { PurgeAllDataModal } from './PurgeAllDataModal';

interface PrivacyTelemetrySectionProps {
  preferences: UserPreferences;
  inventory: StorageInventory;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  onPurgeTemporary: () => void;
  onDeleteScanHistory?: () => boolean;
  onPurgeAllData?: () => Promise<void>;
  onRefreshInventory: () => void;
}

export const PrivacyTelemetrySection: React.FC<PrivacyTelemetrySectionProps> = ({
  preferences,
  inventory,
  onUpdatePreferences,
  onPurgeTemporary,
  onDeleteScanHistory,
  onPurgeAllData,
  onRefreshInventory,
}) => {
  const [retentionDays, setRetentionDays] = useState('30');
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isPurgingAll, setIsPurgingAll] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleToggleEphemeral = async () => {
    await onUpdatePreferences({
      ephemeralLogging: !preferences.ephemeralLogging,
    });
  };

  const handlePurgeTemp = () => {
    onPurgeTemporary();
    setActionFeedback('Diagnostic cache purged successfully.');
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleDeleteHistory = () => {
    if (window.confirm('Permanently delete all scan records from local browser memory?')) {
      if (onDeleteScanHistory) {
        onDeleteScanHistory();
      }
      onRefreshInventory();
      setActionFeedback('Scan history archive eradicated.');
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  const handleConfirmPurgeAll = async () => {
    if (!onPurgeAllData) return;
    setIsPurgingAll(true);
    try {
      await onPurgeAllData();
    } finally {
      setIsPurgingAll(false);
      setIsPurgeModalOpen(false);
    }
  };

  return (
    <section
      id="privacy-section"
      className="relative rounded-3xl bg-surface-dark p-6 sm:p-8 md:p-10 shadow-[0_12px_36px_-8px_rgba(0,0,0,0.6),inset_0_1px_1px_0_rgba(245,242,237,0.1)] border border-glass-border/40 overflow-hidden scroll-mt-28"
    >
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-6 h-6 text-primary" />
        <h2 className="font-headline text-2xl sm:text-3xl text-color-offwhite">
          Privacy &amp; Telemetry
        </h2>
      </div>
      <p className="font-body text-sm text-secondary mb-8">
        ScamShield strictly separates cryptographic signal signatures from private customer payload.
      </p>

      {actionFeedback && (
        <div className="mb-6 p-3 rounded-xl bg-surface-container-high/60 border border-glass-border text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionFeedback}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Scan Archive Toggle */}
        <div className="flex items-start justify-between gap-6 p-5 rounded-2xl bg-surface-container/60 shadow-[inset_0_1px_0_0_rgba(245,242,237,0.06)] border border-glass-border/30">
          <div>
            <span className="font-title text-base font-semibold text-color-offwhite block">
              Ephemeral Cloud Archive
            </span>
            <p className="font-body text-xs text-secondary mt-1">
              Store anonymized heuristic hashes for personal forensic review across linked guardians.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={preferences.ephemeralLogging}
              onChange={handleToggleEphemeral}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-risk-high after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-color-offwhite after:rounded-full after:h-[18px] after:w-[18px] after:transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]" />
          </label>
        </div>

        {/* Retention Policy Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-container/60 shadow-[inset_0_1px_0_0_rgba(245,242,237,0.06)] border border-glass-border/30">
          <div>
            <span className="font-title text-base font-semibold text-color-offwhite block">
              Diagnostic Data Retention
            </span>
            <p className="font-body text-xs text-secondary mt-1">
              Configure automated TTL for temporal threat metadata.
            </p>
          </div>
          <div className="relative">
            <select
              value={retentionDays}
              onChange={(e) => setRetentionDays(e.target.value)}
              className="appearance-none bg-surface-bright text-color-offwhite font-mono text-xs px-4 py-2 pr-10 rounded-full cursor-pointer shadow-[inset_0_1px_0_0_rgba(245,242,237,0.15)] focus:outline-none focus:ring-1 focus:ring-primary/40"
            >
              <option value="7">7 Days (High Ephemeral)</option>
              <option value="30">30 Days (Standard Balanced)</option>
              <option value="90">90 Days (Extended Audit)</option>
              <option value="0">Zero-Retention Mode (RAM only)</option>
            </select>
          </div>
        </div>

        {/* Ephemeral Architecture Assurance Notice */}
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-surface-container-lowest shadow-[inset_0_1px_0_0_rgba(245,242,237,0.04)] border border-glass-border/30">
          <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="font-body text-xs text-secondary leading-relaxed">
            <strong className="text-color-offwhite font-medium">Architectural Zero-Log Guarantee:</strong>{' '}
            Zero message bodies or communication transcripts are ever recorded. Only mathematical n-gram
            representations and structural protocol fingerprints are briefly parsed inside volatile memory.
          </p>
        </div>

        {/* Local Storage Inventory Breakdown & Cache Purge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-low border border-glass-border/30">
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-primary shrink-0" />
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-secondary">
                Local Storage Inventory
              </span>
              <p className="font-mono text-xs text-color-offwhite font-semibold">
                {inventory.totalEstimatedKb} Allocated ({inventory.scanHistoryCount} Scans, {inventory.familyGroupsCount} Family Group)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePurgeTemp}
            className="self-start sm:self-center px-4 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-bright text-color-offwhite font-mono text-xs transition shadow-[inset_0_1px_0_0_rgba(245,242,237,0.1)] cursor-pointer"
          >
            Purge Temporary Cache
          </button>
        </div>

        {/* Destructive Action Section */}
        <div className="relative p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-primary-container/15 via-surface-container-low to-surface-container-low shadow-[0_8px_32px_-4px_rgba(139,13,26,0.35),inset_0_1px_0_0_rgba(255,179,175,0.2)] border border-color-crimson/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-risk-high mb-1">
                <AlertTriangle className="w-4 h-4 text-color-crimson" />
                <span className="font-mono text-xs uppercase tracking-wider font-semibold text-crimson-light">
                  Irreversible Action
                </span>
              </div>
              <h4 className="font-title text-lg font-semibold text-color-offwhite">
                Delete Scan History
              </h4>
              <p className="font-body text-xs text-secondary mt-1 max-w-xl">
                Permanently erase all verified scans, threat telemetry, and neural forensic cache across all
                synchronized devices. This cannot be undone.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleDeleteHistory}
                className="shrink-0 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-risk-high hover:bg-color-crimson text-color-offwhite font-body text-sm font-semibold transition-all shadow-[0_4px_20px_rgba(139,13,26,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Scan History</span>
              </button>

              {onPurgeAllData && (
                <button
                  type="button"
                  onClick={() => setIsPurgeModalOpen(true)}
                  className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-color-crimson/50 hover:bg-color-crimson/20 text-crimson-light font-mono text-xs transition cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Panic Wipe</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Panic Wipe Modal */}
      {onPurgeAllData && (
        <PurgeAllDataModal
          isOpen={isPurgeModalOpen}
          isPurging={isPurgingAll}
          onClose={() => setIsPurgeModalOpen(false)}
          onConfirmPurge={handleConfirmPurgeAll}
        />
      )}
    </section>
  );
};
