import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageContainer } from '../components/common/PageContainer';
import { LoadingState } from '../components/common/LoadingState';
import { FamilyHero } from '../components/family/FamilyHero';
import { CriticalIncidentBanner } from '../components/family/CriticalIncidentBanner';
import { FamilyMemberCard } from '../components/family/FamilyMemberCard';
import { ExpandCircleCard } from '../components/family/ExpandCircleCard';
import { SharedThreatFeed } from '../components/family/SharedThreatFeed';
import { ProtectionMetricsCard } from '../components/family/ProtectionMetricsCard';
import { SharedGuardSettingsCard } from '../components/family/SharedGuardSettingsCard';
import { PrivacyMandateSection } from '../components/family/PrivacyMandateSection';
import { InviteMemberModal } from '../components/family/InviteMemberModal';
import { PendingInvitesDrawer } from '../components/family/PendingInvitesDrawer';
import { EmergencyLockdownModal } from '../components/family/EmergencyLockdownModal';
import { EmergencyLockdownBanner } from '../components/family/EmergencyLockdownBanner';
import { CreateFamilyModal } from '../components/family/CreateFamilyModal';
import { familyRepository } from '../services/family/LocalFamilyProtectionRepository';
import type {
  FamilyGroup,
  FamilyInvite,
  ThreatShare,
  ProtectionSettings,
  FamilyAnalytics,
} from '../types/family';
import { Users, UserPlus } from 'lucide-react';
import { GlassButton } from '../components/common/GlassButton';
import { usePageMeta } from '../hooks/usePageMeta';

export const FamilyProtectionPage: React.FC = () => {
  usePageMeta({
    title: 'Family Defense Circle — ScamShield',
    description: 'Protect your loved ones with proactive threat sharing, zero-knowledge privacy, and emergency circle lockdowns.',
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [familyGroup, setFamilyGroup] = useState<FamilyGroup | null>(null);
  const [threats, setThreats] = useState<ThreatShare[]>([]);
  const [invites, setInvites] = useState<FamilyInvite[]>([]);
  const [analytics, setAnalytics] = useState<FamilyAnalytics>({
    totalSharedThreats: 0,
    highRiskThreats: 0,
    mediumRiskThreats: 0,
    lowRiskThreats: 0,
    activeMembers: 0,
    pendingInvites: 0,
    deflectionRate: 94,
    estimatedSavings: 3420,
    linkChecksCount: 142,
  });

  // Modals state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isPendingDrawerOpen, setIsPendingDrawerOpen] = useState(false);
  const [isLockdownModalOpen, setIsLockdownModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadFamilyData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const group = await familyRepository.getFamilyGroup(user.id);
      setFamilyGroup(group);

      if (group) {
        const [feed, groupInvites, groupAnalytics] = await Promise.all([
          familyRepository.getSharedThreatFeed(group.id),
          familyRepository.getInvites(group.id),
          familyRepository.getAnalytics(group.id),
        ]);
        setThreats(feed);
        setInvites(groupInvites);
        setAnalytics(groupAnalytics);
      }
    } catch (err) {
      console.warn('ScamShield: Failed to load family group data', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFamilyData();
  }, [loadFamilyData]);

  // Handlers
  const handleCreateGroup = async (groupName: string) => {
    if (!user) return;
    const newGroup = await familyRepository.createFamilyGroup(
      user.id,
      groupName,
      user.displayName || 'Guardian Sentry',
      user.email
    );
    setFamilyGroup(newGroup);
    await loadFamilyData();
  };

  const handleInviteMember = async (email: string, relationship: string) => {
    if (!familyGroup || !user) return;
    await familyRepository.inviteMember(
      familyGroup.id,
      user.displayName || user.email,
      email,
      relationship
    );
    await loadFamilyData();
  };

  const handleAcceptInvite = async (inviteId: string) => {
    await familyRepository.acceptInvite(inviteId, 'Family Member');
    await loadFamilyData();
  };

  const handleDeclineInvite = async (inviteId: string) => {
    await familyRepository.declineInvite(inviteId);
    await loadFamilyData();
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!familyGroup || !user) return;
    await familyRepository.removeMember(familyGroup.id, memberId, user.id);
    await loadFamilyData();
  };

  const handleToggleLockdown = async () => {
    if (!familyGroup) return;
    if (familyGroup.emergencyLockdownActive) {
      const updated = await familyRepository.deactivateEmergencyLockdown(familyGroup.id);
      setFamilyGroup(updated);
    } else {
      const updated = await familyRepository.activateEmergencyLockdown(familyGroup.id);
      setFamilyGroup(updated);
    }
    await loadFamilyData();
  };

  const handleUpdateSetting = async (key: keyof ProtectionSettings, value: boolean) => {
    if (!familyGroup) return;
    const updated = await familyRepository.updateProtectionSettings(familyGroup.id, {
      [key]: value,
    });
    setFamilyGroup({
      ...familyGroup,
      protectionSettings: updated,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <LoadingState message="Connecting to shared defense perimeter..." />
      </div>
    );
  }

  // Top critical incident for spotlight (first high risk or first threat)
  const topCriticalIncident = threats.find((t) => t.riskLevel === 'HIGH') || threats[0] || null;

  return (
    <PageContainer maxWidth="7xl">
      <div className="pb-16 animate-fadeIn">
        {/* Atmospheric Glows */}
        <div className="pointer-events-none absolute -top-12 right-10 w-[540px] h-[320px] bg-color-crimson/15 blur-[130px] rounded-full -z-10" />
        <div className="pointer-events-none absolute top-[520px] -left-20 w-[420px] h-[280px] bg-risk-medium/10 blur-[140px] rounded-full -z-10" />

        {/* Empty State: If authenticated user has no family group */}
        {!familyGroup ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-6 max-w-xl mx-auto animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-surface-container-high border border-glass-border flex items-center justify-center text-primary shadow-xl">
              <Users className="w-8 h-8 text-color-crimson" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high/60 border border-glass-border">
                <span className="w-2 h-2 rounded-full bg-risk-medium" />
                <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                  SHARED PERIMETER INACTIVE
                </span>
              </div>
              <h1 className="font-headline text-3xl sm:text-4xl text-color-offwhite tracking-tight">
                Your protection circle is empty.
              </h1>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                Connect relatives, parents, or children to a unified family defense shield. Monitor forwarded scams, share sanitized threat telemetry, and coordinate safety in real-time.
              </p>
            </div>

            <GlassButton
              variant="primary"
              size="lg"
              onClick={() => setIsCreateModalOpen(true)}
              icon={<UserPlus className="w-4 h-4" />}
            >
              Establish Family Shield
            </GlassButton>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Emergency Lockdown Banner if active */}
            {familyGroup.emergencyLockdownActive && (
              <EmergencyLockdownBanner
                activatedAt={familyGroup.emergencyLockdownActivatedAt}
                onDeactivateClick={() => setIsLockdownModalOpen(true)}
              />
            )}

            {/* Page Header & Synopsis Hero */}
            <FamilyHero
              members={familyGroup.members}
              isLockdownActive={familyGroup.emergencyLockdownActive}
              onInviteClick={() => setIsInviteOpen(true)}
              onLockdownClick={() => setIsLockdownModalOpen(true)}
            />

            {/* Critical Alert Spotlight: Mom High Risk Banner */}
            {topCriticalIncident && (
              <CriticalIncidentBanner
                topIncident={topCriticalIncident}
                onViewAnalysis={() => navigate('/scan')}
              />
            )}

            {/* Family Members Section */}
            <section className="relative z-10 w-full text-left">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-6">
                <div>
                  <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block">
                    GUARDED ACCOUNTS
                  </span>
                  <h2 className="font-headline text-2xl sm:text-3xl text-color-offwhite tracking-tight">
                    {familyGroup.name}
                  </h2>
                </div>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant max-w-md leading-relaxed">
                  Synchronized shield status across family hardware profiles. Real-time telemetry prevents lookalike clicks.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {familyGroup.members
                  .filter((m) => m.status === 'ACTIVE')
                  .map((member) => (
                    <FamilyMemberCard
                      key={member.id}
                      member={member}
                      isOwner={familyGroup.ownerId === user?.id}
                      currentUserId={user?.id}
                      onRemoveMember={handleRemoveMember}
                      onAuditMember={() => navigate('/history')}
                    />
                  ))}

                {/* 4th Card: Expand Circle invitation prompt */}
                <ExpandCircleCard onInviteClick={() => setIsInviteOpen(true)} />
              </div>
            </section>

            {/* Split Section: Shared Threat Feed & Collective Shield Stats */}
            <section className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: Chronological Audit Timeline (8 cols) */}
              <div className="lg:col-span-8">
                <SharedThreatFeed
                  threats={threats}
                  onInspectPayload={() => navigate('/history')}
                />
              </div>

              {/* Right: Metrics & Shared Guard Settings (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <ProtectionMetricsCard analytics={analytics} />
                <SharedGuardSettingsCard
                  settings={familyGroup.protectionSettings}
                  onUpdateSetting={handleUpdateSetting}
                />
              </div>
            </section>

            {/* Privacy Reassurance Mandate Section */}
            <PrivacyMandateSection />
          </div>
        )}

        {/* Modals */}
        <InviteMemberModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          onInvite={handleInviteMember}
          onOpenPendingInvites={() => setIsPendingDrawerOpen(true)}
          pendingCount={invites.length}
        />

        <PendingInvitesDrawer
          isOpen={isPendingDrawerOpen}
          onClose={() => setIsPendingDrawerOpen(false)}
          invites={invites}
          onAccept={handleAcceptInvite}
          onDecline={handleDeclineInvite}
        />

        <EmergencyLockdownModal
          isOpen={isLockdownModalOpen}
          isActive={familyGroup?.emergencyLockdownActive ?? false}
          onClose={() => setIsLockdownModalOpen(false)}
          onConfirm={handleToggleLockdown}
        />

        <CreateFamilyModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateGroup}
          defaultName={user?.displayName ? `${user.displayName.split(' ')[0]}'s Family Shield` : 'My Family Shield'}
        />
      </div>
    </PageContainer>
  );
};

export default FamilyProtectionPage;
