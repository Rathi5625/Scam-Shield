import React from 'react';
import {
  UserCheck,
  Fingerprint,
  Users,
  Key,
  Palette,
  FileText,
} from 'lucide-react';

interface SettingsLeftRailProps {
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
  storageKb: string;
}

const NAV_ITEMS = [
  { id: 'account-section', label: 'Account Profile', icon: UserCheck },
  { id: 'privacy-section', label: 'Privacy & Telemetry', icon: Fingerprint },
  { id: 'family-section', label: 'Family Protection', icon: Users },
  { id: 'security-section', label: 'Authentication', icon: Key },
  { id: 'appearance-section', label: 'Appearance', icon: Palette },
  { id: 'governance-section', label: 'System & Legal', icon: FileText },
];

export const SettingsLeftRail: React.FC<SettingsLeftRailProps> = ({
  activeSection,
  onSelectSection,
  storageKb,
}) => {
  return (
    <aside className="space-y-2">
      <div className="p-3 rounded-2xl bg-surface-dark shadow-[inset_0_1px_0_0_rgba(245,242,237,0.08)] border border-glass-border/40">
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm ${
                  isActive
                    ? 'bg-surface-container-high/60 text-color-offwhite font-medium shadow-[inset_0_1px_0_0_rgba(245,242,237,0.15)]'
                    : 'text-secondary hover:text-color-offwhite hover:bg-surface-container'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors shrink-0 ${
                    isActive ? 'text-primary' : 'group-hover:text-primary'
                  }`}
                />
                <span className="font-body text-sm truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Heartbeat Indicator */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-[inset_0_1px_0_0_rgba(245,242,237,0.04)] border border-glass-border/40">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-secondary">
            Cryptographic Hash
          </span>
          <span className="font-mono text-xs text-risk-low font-semibold">OK-892</span>
        </div>
        <p className="font-mono text-[11px] text-on-surface-variant/80 mt-1 truncate">
          SHA256: 9b2d...f720 • {storageKb}
        </p>
      </div>
    </aside>
  );
};
