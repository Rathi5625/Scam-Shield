import type {
  FamilyGroup,
  FamilyMember,
  FamilyInvite,
  ThreatShare,
  ProtectionSettings,
  FamilyRole,
  FamilyAnalytics,
} from '../../types/family';
import type { FamilyProtectionRepository } from './FamilyProtectionRepository';
import { sanitizeTextPreview, sanitizeUrl } from '../history/LocalScanHistoryRepository';

const GROUPS_KEY = 'scamshield_family_groups_v1';
const INVITES_KEY = 'scamshield_family_invites_v1';
const THREATS_KEY = 'scamshield_family_threats_v1';

export class LocalFamilyProtectionRepository implements FamilyProtectionRepository {
  constructor() {
    // Production mode: Clean state. Authentic user data is loaded from user interactions.
  }

  private readStorage<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return fallback;
      const parsed = JSON.parse(data);
      if (Array.isArray(fallback) && !Array.isArray(parsed)) {
        return fallback;
      }
      return parsed ?? fallback;
    } catch {
      console.warn(`ScamShield: Storage key ${key} inaccessible or corrupt.`);
      return fallback;
    }
  }

  private writeStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn(`ScamShield: Failed to persist to storage key ${key}.`);
    }
  }

  async getFamilyGroup(userId: string): Promise<FamilyGroup | null> {
    const groups = this.readStorage<FamilyGroup[]>(GROUPS_KEY, []);
    // Find group where user is owner or active member
    const group = groups.find(
      (g) => g.ownerId === userId || g.members.some((m) => m.userId === userId && m.status === 'ACTIVE')
    );
    return group || null;
  }

  async createFamilyGroup(
    userId: string,
    groupName: string,
    ownerName: string,
    ownerEmail: string
  ): Promise<FamilyGroup> {
    const groups = this.readStorage<FamilyGroup[]>(GROUPS_KEY, []);
    // Check if user already owns or belongs to a group
    const existing = groups.find((g) => g.ownerId === userId);
    if (existing) {
      return existing;
    }

    const newGroup: FamilyGroup = {
      id: `fam_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ownerId: userId,
      name: groupName.trim() || 'My Family Shield',
      createdAt: new Date().toISOString(),
      emergencyLockdownActive: false,
      protectionSettings: {
        aggressivePhishing: true,
        realTimeHeuristics: true,
        familyAlerts: true,
        ephemeralLogging: true,
        emergencyLockdown: false,
        instantSmsAlerts: true,
        silentQuarantine: true,
      },
      members: [
        {
          id: `mem_${Date.now()}`,
          userId,
          displayName: ownerName || 'Shield Guardian',
          email: ownerEmail,
          role: 'OWNER',
          status: 'ACTIVE',
          joinedAt: new Date().toISOString(),
          relationship: 'Self (Guardian)',
          deviceInfo: 'Primary Terminal',
          defenseState: 'ALL CLEAR',
          activeThreatsCount: 0,
        },
      ],
    };

    groups.push(newGroup);
    this.writeStorage(GROUPS_KEY, groups);
    return newGroup;
  }

  async inviteMember(
    familyGroupId: string,
    invitedBy: string,
    email: string,
    relationship?: string
  ): Promise<FamilyInvite> {
    const groups = this.readStorage<FamilyGroup[]>(GROUPS_KEY, []);
    const group = groups.find((g) => g.id === familyGroupId);
    if (!group) throw new Error('Family group not found.');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Valid email address is required.');
    }

    // Check if already member
    const alreadyMember = group.members.some((m) => m.email.toLowerCase() === cleanEmail);
    if (alreadyMember) {
      throw new Error('This user is already an active member of the family group.');
    }

    const invites = this.readStorage<FamilyInvite[]>(INVITES_KEY, []);
    const alreadyPending = invites.some(
      (inv) => inv.familyGroupId === familyGroupId && inv.email.toLowerCase() === cleanEmail && inv.status === 'PENDING'
    );
    if (alreadyPending) {
      throw new Error('An invitation is already pending for this email address.');
    }

    const newInvite: FamilyInvite = {
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      familyGroupId,
      email: cleanEmail,
      invitedBy,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      relationship: relationship || 'Family Member',
    };

    invites.push(newInvite);
    this.writeStorage(INVITES_KEY, invites);
    return newInvite;
  }

  async getInvites(familyGroupId: string): Promise<FamilyInvite[]> {
    const invites = this.readStorage<FamilyInvite[]>(INVITES_KEY, []);
    return invites.filter((inv) => inv.familyGroupId === familyGroupId && inv.status === 'PENDING');
  }

  async acceptInvite(
    inviteId: string,
    memberDisplayName: string,
    memberUserId?: string
  ): Promise<FamilyMember> {
    const invites = this.readStorage<FamilyInvite[]>(INVITES_KEY, []);
    const invite = invites.find((inv) => inv.id === inviteId);
    if (!invite || invite.status !== 'PENDING') {
      throw new Error('Valid pending invitation not found.');
    }

    const groups = this.readStorage<FamilyGroup[]>(GROUPS_KEY, []);
    const group = groups.find((g) => g.id === invite.familyGroupId);
    if (!group) throw new Error('Target family group does not exist.');

    const newMember: FamilyMember = {
      id: `mem_${Date.now()}`,
      userId: memberUserId,
      displayName: memberDisplayName || invite.email.split('@')[0],
      email: invite.email,
      role: 'MEMBER',
      status: 'ACTIVE',
      joinedAt: new Date().toISOString(),
      relationship: invite.relationship || 'Family Member',
      deviceInfo: 'Guarded Mobile Profile',
      defenseState: 'ALL CLEAR',
      activeThreatsCount: 0,
    };

    group.members.push(newMember);
    invite.status = 'ACCEPTED';

    this.writeStorage(GROUPS_KEY, groups);
    this.writeStorage(INVITES_KEY, invites);

    return newMember;
  }

  async declineInvite(inviteId: string): Promise<boolean> {
    const invites = this.readStorage<FamilyInvite[]>(INVITES_KEY, []);
    const invite = invites.find((inv) => inv.id === inviteId);
    if (!invite) return false;

    invite.status = 'DECLINED';
    this.writeStorage(INVITES_KEY, invites);
    return true;
  }

  async removeMember(
    familyGroupId: string,
    memberId: string,
    requesterUserId: string
  ): Promise<boolean> {
    const groups = this.readStorage<FamilyGroup[]>(GROUPS_KEY, []);
    const group = groups.find((g) => g.id === familyGroupId);
    if (!group) return false;

    // Verify requester is OWNER
    const requester = group.members.find((m) => m.userId === requesterUserId || group.ownerId === requesterUserId);
    if (!requester || requester.role !== 'OWNER') {
      throw new Error('Only the family group owner can remove members.');
    }

    const targetMember = group.members.find((m) => m.id === memberId);
    if (!targetMember) return false;

    // Prevent owner from removing themselves
    if (targetMember.role === 'OWNER' || targetMember.userId === group.ownerId) {
      throw new Error('Family group owner cannot remove themselves from the protection circle.');
    }

    group.members = group.members.filter((m) => m.id !== memberId);
    this.writeStorage(GROUPS_KEY, groups);
    return true;
  }

  async updateMemberRole(
    familyGroupId: string,
    memberId: string,
    newRole: FamilyRole,
    requesterUserId: string
  ): Promise<boolean> {
    const groups = this.readStorage<FamilyGroup[]>(GROUPS_KEY, []);
    const group = groups.find((g) => g.id === familyGroupId);
    if (!group) return false;

    if (group.ownerId !== requesterUserId) {
      throw new Error('Only the group owner can modify roles.');
    }

    const member = group.members.find((m) => m.id === memberId);
    if (!member) return false;
    if (member.role === 'OWNER' && newRole !== 'OWNER') {
      throw new Error('Cannot demote primary group owner.');
    }

    member.role = newRole;
    this.writeStorage(GROUPS_KEY, groups);
    return true;
  }

  async getSharedThreatFeed(familyGroupId: string): Promise<ThreatShare[]> {
    const threats = this.readStorage<ThreatShare[]>(THREATS_KEY, []);
    return threats
      .filter((thr) => thr.familyGroupId === familyGroupId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async shareThreat(threat: Omit<ThreatShare, 'id' | 'createdAt'>): Promise<ThreatShare> {
    const threats = this.readStorage<ThreatShare[]>(THREATS_KEY, []);

    // Sanitize summary to ensure zero PII leaks
    const cleanSummary = sanitizeTextPreview(threat.summary);
    const cleanDomain = threat.targetDomain ? sanitizeUrl(threat.targetDomain) : undefined;

    const newThreat: ThreatShare = {
      ...threat,
      summary: cleanSummary,
      targetDomain: cleanDomain,
      id: `thr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      exposureStatus:
        threat.riskLevel === 'HIGH'
          ? 'Zero Exposure'
          : threat.riskLevel === 'MEDIUM'
          ? 'Warned User'
          : 'Verified Authentic',
    };

    threats.unshift(newThreat);
    this.writeStorage(THREATS_KEY, threats);
    return newThreat;
  }

  async getProtectionSettings(familyGroupId: string): Promise<ProtectionSettings> {
    const groups = this.readStorage<FamilyGroup[]>(GROUPS_KEY, []);
    const group = groups.find((g) => g.id === familyGroupId);
    if (!group) {
      return {
        aggressivePhishing: true,
        realTimeHeuristics: true,
        familyAlerts: true,
        ephemeralLogging: true,
        emergencyLockdown: false,
        instantSmsAlerts: true,
        silentQuarantine: true,
      };
    }
    return group.protectionSettings;
  }

  async updateProtectionSettings(
    familyGroupId: string,
    settings: Partial<ProtectionSettings>
  ): Promise<ProtectionSettings> {
    const groups = this.readStorage<FamilyGroup[]>(GROUPS_KEY, []);
    const group = groups.find((g) => g.id === familyGroupId);
    if (!group) throw new Error('Family group not found.');

    group.protectionSettings = {
      ...group.protectionSettings,
      ...settings,
    };

    this.writeStorage(GROUPS_KEY, groups);
    return group.protectionSettings;
  }

  async activateEmergencyLockdown(familyGroupId: string): Promise<FamilyGroup> {
    const groups = this.readStorage<FamilyGroup[]>(GROUPS_KEY, []);
    const group = groups.find((g) => g.id === familyGroupId);
    if (!group) throw new Error('Family group not found.');

    group.emergencyLockdownActive = true;
    group.emergencyLockdownActivatedAt = new Date().toISOString();
    group.protectionSettings.emergencyLockdown = true;

    this.writeStorage(GROUPS_KEY, groups);

    // Also record lockdown activation in threat feed
    await this.shareThreat({
      familyGroupId,
      sharedBy: 'Guardian Sentry',
      scanType: 'TEXT',
      riskLevel: 'HIGH',
      riskScore: 99,
      category: 'EMERGENCY_LOCKDOWN',
      summary: 'Emergency Lockdown Protocol activated for family protection perimeter. Heightened threat interception engaged.',
      vector: 'Guardian Override',
      exposureStatus: 'Zero Exposure',
    });

    return group;
  }

  async deactivateEmergencyLockdown(familyGroupId: string): Promise<FamilyGroup> {
    const groups = this.readStorage<FamilyGroup[]>(GROUPS_KEY, []);
    const group = groups.find((g) => g.id === familyGroupId);
    if (!group) throw new Error('Family group not found.');

    group.emergencyLockdownActive = false;
    group.emergencyLockdownActivatedAt = undefined;
    group.protectionSettings.emergencyLockdown = false;

    this.writeStorage(GROUPS_KEY, groups);

    // Record deactivation in feed
    await this.shareThreat({
      familyGroupId,
      sharedBy: 'Guardian Sentry',
      scanType: 'TEXT',
      riskLevel: 'LOW',
      riskScore: 10,
      category: 'LOCKDOWN_RESOLVED',
      summary: 'Emergency Lockdown Protocol deactivated. Standard heuristic monitoring restored.',
      vector: 'Guardian Override',
      exposureStatus: 'Verified Authentic',
    });

    return group;
  }

  async getAnalytics(familyGroupId: string): Promise<FamilyAnalytics> {
    const threats = await this.getSharedThreatFeed(familyGroupId);
    const groups = this.readStorage<FamilyGroup[]>(GROUPS_KEY, []);
    const group = groups.find((g) => g.id === familyGroupId);
    const invites = await this.getInvites(familyGroupId);

    const activeMembers = group ? group.members.filter((m) => m.status === 'ACTIVE').length : 0;
    const pendingInvites = invites.length;

    let high = 0;
    let med = 0;
    let low = 0;

    threats.forEach((t) => {
      if (t.riskLevel === 'HIGH') high++;
      else if (t.riskLevel === 'MEDIUM') med++;
      else if (t.riskLevel === 'LOW') low++;
    });

    const total = threats.length;
    const deflectionRate = total > 0 ? Math.round(((high + med) / total) * 100) : 0;
    const linkChecks = threats.filter(
      (t) => t.scanType === 'LINK' || (t.vector && t.vector.toLowerCase().includes('link'))
    ).length;

    return {
      totalSharedThreats: total,
      highRiskThreats: high,
      mediumRiskThreats: med,
      lowRiskThreats: low,
      activeMembers,
      pendingInvites,
      deflectionRate,
      estimatedSavings: 0,
      linkChecksCount: linkChecks,
    };
  }
}

// Export local singleton and dynamic environment-aware repository
import { apiFamilyRepository } from './ApiFamilyProtectionRepository';

export const localFamilyRepository = new LocalFamilyProtectionRepository();

export const familyRepository: FamilyProtectionRepository =
  import.meta.env.VITE_DATA_MODE === 'API'
    ? apiFamilyRepository
    : localFamilyRepository;

