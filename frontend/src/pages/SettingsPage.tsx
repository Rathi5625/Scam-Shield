import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/common/PageContainer';
import { useAuth } from '../context/AuthContext';
import { dataManagementService, type StorageInventory } from '../services/data/DataManagementService';
import { SettingsLeftRail } from '../components/settings/SettingsLeftRail';
import { AccountSection } from '../components/settings/AccountSection';
import { PrivacyTelemetrySection } from '../components/settings/PrivacyTelemetrySection';
import { FamilyPreferencesSection } from '../components/settings/FamilyPreferencesSection';
import { SecurityAuthSection } from '../components/settings/SecurityAuthSection';
import { AppearanceModeSection } from '../components/settings/AppearanceModeSection';
import { GovernanceSection } from '../components/settings/GovernanceSection';
import type { UserPreferences } from '../types/auth';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, updatePreferences, signOut } = useAuth();

  const [activeSection, setActiveSection] = useState<string>('account-section');
  const [inventory, setInventory] = useState<StorageInventory>(() =>
    dataManagementService.getInventory()
  );

  const refreshInventory = useCallback(() => {
    setInventory(dataManagementService.getInventory());
  }, []);

  useEffect(() => {
    refreshInventory();
  }, [refreshInventory]);

  // Handle smooth scroll to section
  const handleSelectSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scroll listener to update active section in sticky rail
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'account-section',
        'privacy-section',
        'family-section',
        'security-section',
        'appearance-section',
        'governance-section',
      ];
      const scrollY = window.scrollY + 140;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUpdateProfile = async (data: { displayName?: string }) => {
    await updateProfile(data);
    refreshInventory();
  };

  const handleUpdatePreferences = async (prefs: Partial<UserPreferences>) => {
    await updatePreferences(prefs);
    refreshInventory();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handlePurgeTemporary = () => {
    dataManagementService.purgeTemporaryData();
    refreshInventory();
  };

  const handleDeleteScanHistory = () => {
    const res = dataManagementService.deleteScanHistory();
    refreshInventory();
    return res;
  };

  const handlePurgeAllData = async () => {
    dataManagementService.purgeAllData();
    await signOut();
    navigate('/login');
  };

  // Fallback safe preferences if user is not fully loaded
  const currentPreferences: UserPreferences = user?.preferences || {
    aggressivePhishingShield: true,
    realtimeHeuristics: true,
    familyAlerts: true,
    ephemeralLogging: true,
  };

  return (
    <PageContainer maxWidth="7xl">
      <div className="pb-24">
        {/* Stitch Source of Truth Header */}
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-widest text-on-surface-variant">
              Control Center • Preferences & Defense Policy
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl lg:text-5xl text-on-surface font-light tracking-tight">
                Settings
              </h1>
              <p className="text-on-surface-variant font-sans text-sm mt-1 max-w-xl">
                Manage cryptographic credentials, zero-trust telemetry thresholds, and family ward relays.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-surface-container/60 border border-outline-variant/30 px-4 py-2 rounded-lg backdrop-blur-md">
              <span className="text-xs font-mono text-on-surface-variant">
                Sentry Node: <span className="text-primary font-bold">Active</span>
              </span>
              <span className="text-outline-variant">|</span>
              <span className="text-xs font-mono text-on-surface-variant">
                Latency: <span className="text-on-surface font-semibold">0.82s</span>
              </span>
            </div>
          </div>
        </header>

        {/* 12-Column Responsive Layout Matching Stitch */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Rail (3 columns on lg screens, sticky) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-28 space-y-2">
            <SettingsLeftRail
              activeSection={activeSection}
              onSelectSection={handleSelectSection}
              storageKb={inventory.totalEstimatedKb}
            />
          </aside>

          {/* Main Settings Content (9 columns on lg screens) */}
          <main className="lg:col-span-9 space-y-12">
            <AccountSection
              user={user}
              onUpdateProfile={handleUpdateProfile}
              onSignOut={handleSignOut}
            />

            <PrivacyTelemetrySection
              preferences={currentPreferences}
              inventory={inventory}
              onUpdatePreferences={handleUpdatePreferences}
              onPurgeTemporary={handlePurgeTemporary}
              onRefreshInventory={refreshInventory}
              onDeleteScanHistory={handleDeleteScanHistory}
              onPurgeAllData={handlePurgeAllData}
            />

            <FamilyPreferencesSection
              preferences={currentPreferences}
              onUpdatePreferences={handleUpdatePreferences}
            />

            <SecurityAuthSection />

            <AppearanceModeSection />

            <GovernanceSection />
          </main>
        </div>
      </div>
    </PageContainer>
  );
};
