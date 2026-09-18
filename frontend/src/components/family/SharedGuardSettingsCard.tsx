import React from 'react';
import { GlassToggle } from '../common/GlassToggle';
import type { ProtectionSettings } from '../../types/family';

interface SharedGuardSettingsCardProps {
  settings: ProtectionSettings;
  onUpdateSetting: (key: keyof ProtectionSettings, value: boolean) => void;
}

export const SharedGuardSettingsCard: React.FC<SharedGuardSettingsCardProps> = ({
  settings,
  onUpdateSetting,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-surface-container-low/90 backdrop-blur-xl shadow-xl flex flex-col border border-glass-border text-left">
      <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block">
        SHARED CONTROLS
      </span>
      <h4 className="font-headline text-xl text-color-offwhite mt-1">
        Shared Guard Settings
      </h4>
      <p className="font-body text-xs text-on-surface-variant mt-1 mb-4 leading-relaxed">
        Adjust alert thresholds, eldercare quarantine, and automated push alerts.
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high/40 border border-glass-border">
          <div className="flex flex-col pr-3">
            <span className="font-headline text-xs text-color-offwhite">
              Instant SMS Warning to Guardians
            </span>
            <span className="font-body text-[11px] text-on-surface-variant mt-0.5">
              Notify you immediately if relative opens an unverified link
            </span>
          </div>
          <GlassToggle
            checked={settings.instantSmsAlerts ?? true}
            onChange={(checked) => onUpdateSetting('instantSmsAlerts', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high/40 border border-glass-border">
          <div className="flex flex-col pr-3">
            <span className="font-headline text-xs text-color-offwhite">
              Silent Quarantine for Eldercare
            </span>
            <span className="font-body text-[11px] text-on-surface-variant mt-0.5">
              Suppress known fraudulent toll and credit union prompts
            </span>
          </div>
          <GlassToggle
            checked={settings.silentQuarantine ?? true}
            onChange={(checked) => onUpdateSetting('silentQuarantine', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high/40 border border-glass-border">
          <div className="flex flex-col pr-3">
            <span className="font-headline text-xs text-color-offwhite">
              Aggressive Phishing Interception
            </span>
            <span className="font-body text-[11px] text-on-surface-variant mt-0.5">
              Zero-day punycode & homograph domain deflection
            </span>
          </div>
          <GlassToggle
            checked={settings.aggressivePhishing}
            onChange={(checked) => onUpdateSetting('aggressivePhishing', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high/40 border border-glass-border">
          <div className="flex flex-col pr-3">
            <span className="font-headline text-xs text-color-offwhite">
              Ephemeral Logging Protocol
            </span>
            <span className="font-body text-[11px] text-on-surface-variant mt-0.5">
              Redact all OTPs, PINs, and personal message data
            </span>
          </div>
          <GlassToggle
            checked={settings.ephemeralLogging}
            onChange={(checked) => onUpdateSetting('ephemeralLogging', checked)}
          />
        </div>
      </div>
    </div>
  );
};
