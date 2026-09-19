import type {
  FamilyGroup,
  FamilyMember,
  FamilyInvite,
  ThreatShare,
  ProtectionSettings,
  FamilyRole,
  FamilyMemberStatus,
  FamilyAnalytics,
} from '../../types/family';
import type { FamilyProtectionRepository } from './FamilyProtectionRepository';
import { apiClient } from '../api/apiClient';

interface BackendFamilyMember {
  id: string;
  userId?: string;
  displayName?: string;
  email?: string;
  role?: string;
  status?: string;
  joinedAt?: string;
  relationship?: string;
  deviceInfo?: string;
  defenseState?: string;
  activeThreatsCount?: number;
  avatarUrl?: string;
}

interface BackendFamilyGroup {
  groupId: string;
  ownerId: string;
  groupName: string;
  members?: BackendFamilyMember[];
  emergencyLockdownActive?: boolean;
  emergencyLockdownActivatedAt?: string;
  protectionSettings?: Record<string, unknown>;
  createdAt: string;
}

interface BackendInvite {
  inviteId: string;
  groupId: string;
  invitedBy: string;
  invitedEmail: string;
  relationship?: string;
  status: string;
  createdAt: string;
  expiresAt?: string;
}

interface BackendThreatShare {
  id: string;
  familyGroupId: string;
  sharedBy: string;
  scanType: string;
  riskLevel: string;
  riskScore: number;
  category: string;
  summary: string;
  vector: string;
  exposureStatus: string;
  createdAt: string;
}

function mapBackendToFamilyGroup(b: BackendFamilyGroup): FamilyGroup {
  const members: FamilyMember[] = (b.members || []).map((m) => {
    let status: FamilyMemberStatus = 'ACTIVE';
    if (m.status === 'DECLINED') status = 'DECLINED';
    else if (m.status === 'PENDING' || m.status === 'INVITED') status = 'PENDING';

    return {
      id: m.id,
      userId: m.userId,
      displayName: m.displayName || 'Ward Member',
      email: m.email || '',
      role: (m.role === 'OWNER' ? 'OWNER' : 'MEMBER') as FamilyRole,
      status,
      joinedAt: m.joinedAt || new Date().toISOString(),
      relationship: m.relationship || 'Ward',
      deviceInfo: m.deviceInfo || 'Personal Device',
      defenseState: (m.defenseState || 'ALL CLEAR') as 'ALL CLEAR' | 'ATTENTION REQUIRED' | 'PROTECTED',
      activeThreatsCount: m.activeThreatsCount ?? 0,
      avatarUrl: m.avatarUrl,
    };
  });

  const ps = b.protectionSettings || {};
  const protectionSettings: ProtectionSettings = {
    aggressivePhishing: Boolean(ps.aggressivePhishing ?? true),
    realTimeHeuristics: Boolean(ps.realTimeHeuristics ?? true),
    familyAlerts: Boolean(ps.familyAlerts ?? true),
    ephemeralLogging: Boolean(ps.ephemeralLogging ?? true),
    emergencyLockdown: Boolean(b.emergencyLockdownActive ?? false),
    instantSmsAlerts: Boolean(ps.instantSmsAlerts ?? true),
    silentQuarantine: Boolean(ps.silentQuarantine ?? true),
  };

  return {
    id: b.groupId,
    ownerId: b.ownerId,
    name: b.groupName,
    createdAt: b.createdAt,
    members,
    emergencyLockdownActive: Boolean(b.emergencyLockdownActive),
    emergencyLockdownActivatedAt: b.emergencyLockdownActivatedAt,
    protectionSettings,
  };
}

export class ApiFamilyProtectionRepository implements FamilyProtectionRepository {
  async getFamilyGroup(userId: string): Promise<FamilyGroup | null> {
    try {
      const res = await apiClient.get<BackendFamilyGroup>('/family/group', { userId });
      return res ? mapBackendToFamilyGroup(res) : null;
    } catch {
      return null;
    }
  }

  async createFamilyGroup(
    userId: string,
    groupName: string,
    ownerName: string,
    ownerEmail: string
  ): Promise<FamilyGroup> {
    const res = await apiClient.post<BackendFamilyGroup>('/family/group', {
      ownerId: userId,
      groupName,
      ownerName,
      ownerEmail,
    });
    return mapBackendToFamilyGroup(res);
  }

  async inviteMember(
    familyGroupId: string,
    invitedBy: string,
    email: string,
    relationship?: string
  ): Promise<FamilyInvite> {
    const res = await apiClient.post<BackendInvite>('/family/invite', {
      groupId: familyGroupId,
      invitedBy,
      email,
      relationship: relationship || 'Family Member',
    });

    const status: 'PENDING' | 'ACCEPTED' | 'DECLINED' =
      res.status === 'ACCEPTED' ? 'ACCEPTED' : res.status === 'DECLINED' ? 'DECLINED' : 'PENDING';

    return {
      id: res.inviteId,
      familyGroupId: res.groupId,
      email: res.invitedEmail,
      invitedBy: res.invitedBy,
      relationship: res.relationship,
      status,
      createdAt: res.createdAt,
    };
  }

  async getInvites(familyGroupId: string): Promise<FamilyInvite[]> {
    try {
      const res = await apiClient.get<BackendInvite[]>('/family/invites', { groupId: familyGroupId });
      return (res || []).map((i) => {
        const status: 'PENDING' | 'ACCEPTED' | 'DECLINED' =
          i.status === 'ACCEPTED' ? 'ACCEPTED' : i.status === 'DECLINED' ? 'DECLINED' : 'PENDING';
        return {
          id: i.inviteId,
          familyGroupId: i.groupId,
          email: i.invitedEmail,
          invitedBy: i.invitedBy,
          relationship: i.relationship,
          status,
          createdAt: i.createdAt,
        };
      });
    } catch {
      return [];
    }
  }

  async acceptInvite(
    inviteId: string,
    memberDisplayName: string,
    memberUserId?: string
  ): Promise<FamilyMember> {
    const m = await apiClient.post<BackendFamilyMember>(`/family/invite/${encodeURIComponent(inviteId)}/accept`, {
      memberDisplayName,
      memberUserId,
    });

    return {
      id: m.id,
      userId: m.userId,
      displayName: m.displayName || 'Ward Member',
      email: m.email || '',
      role: (m.role === 'OWNER' ? 'OWNER' : 'MEMBER') as FamilyRole,
      status: 'ACTIVE',
      joinedAt: m.joinedAt || new Date().toISOString(),
      relationship: m.relationship || 'Ward',
      deviceInfo: m.deviceInfo || 'Personal Device',
      defenseState: (m.defenseState || 'ALL CLEAR') as 'ALL CLEAR' | 'ATTENTION REQUIRED' | 'PROTECTED',
      activeThreatsCount: m.activeThreatsCount ?? 0,
      avatarUrl: m.avatarUrl,
    };
  }

  async declineInvite(inviteId: string): Promise<boolean> {
    try {
      await apiClient.post(`/family/invite/${encodeURIComponent(inviteId)}/decline`);
      return true;
    } catch {
      return false;
    }
  }

  async removeMember(familyGroupId: string, memberId: string, requesterUserId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/family/group/${encodeURIComponent(familyGroupId)}/members/${encodeURIComponent(memberId)}`, {
        requesterUserId,
      });
      return true;
    } catch {
      return false;
    }
  }

  async updateMemberRole(
    familyGroupId: string,
    memberId: string,
    newRole: FamilyRole,
    requesterUserId: string
  ): Promise<boolean> {
    try {
      await apiClient.put(
        `/family/group/${encodeURIComponent(familyGroupId)}/members/${encodeURIComponent(memberId)}/role`,
        {
          newRole,
          requesterUserId,
        }
      );
      return true;
    } catch {
      return false;
    }
  }

  async getSharedThreatFeed(familyGroupId: string): Promise<ThreatShare[]> {
    try {
      const res = await apiClient.get<BackendThreatShare[]>('/family/feed', { groupId: familyGroupId });
      return (res || []).map((t) => {
        const scanType: 'TEXT' | 'SCREENSHOT' | 'LINK' =
          t.scanType === 'SCREENSHOT' || t.scanType === 'IMAGE'
            ? 'SCREENSHOT'
            : t.scanType === 'LINK' || t.scanType === 'URL'
            ? 'LINK'
            : 'TEXT';

        const exposureStatus: 'Zero Exposure' | 'Warned User' | 'Verified Authentic' =
          t.exposureStatus === 'Warned User'
            ? 'Warned User'
            : t.exposureStatus === 'Verified Authentic'
            ? 'Verified Authentic'
            : 'Zero Exposure';

        return {
          id: t.id,
          familyGroupId: t.familyGroupId,
          sharedBy: t.sharedBy,
          scanType,
          riskLevel: (t.riskLevel || 'HIGH') as 'LOW' | 'MEDIUM' | 'HIGH',
          riskScore: t.riskScore ?? 0,
          category: t.category,
          summary: t.summary,
          vector: t.vector,
          exposureStatus,
          createdAt: t.createdAt,
        };
      });
    } catch {
      return [];
    }
  }

  async shareThreat(threat: Omit<ThreatShare, 'id' | 'createdAt'>): Promise<ThreatShare> {
    const res = await apiClient.post<BackendThreatShare>('/family/threats/share', threat);
    const scanType: 'TEXT' | 'SCREENSHOT' | 'LINK' =
      res.scanType === 'SCREENSHOT' || res.scanType === 'IMAGE'
        ? 'SCREENSHOT'
        : res.scanType === 'LINK' || res.scanType === 'URL'
        ? 'LINK'
        : 'TEXT';

    const exposureStatus: 'Zero Exposure' | 'Warned User' | 'Verified Authentic' =
      res.exposureStatus === 'Warned User'
        ? 'Warned User'
        : res.exposureStatus === 'Verified Authentic'
        ? 'Verified Authentic'
        : 'Zero Exposure';

    return {
      id: res.id,
      familyGroupId: res.familyGroupId,
      sharedBy: res.sharedBy,
      scanType,
      riskLevel: (res.riskLevel || 'HIGH') as 'LOW' | 'MEDIUM' | 'HIGH',
      riskScore: res.riskScore ?? 0,
      category: res.category,
      summary: res.summary,
      vector: res.vector,
      exposureStatus,
      createdAt: res.createdAt,
    };
  }

  async getProtectionSettings(familyGroupId: string): Promise<ProtectionSettings> {
    const group = await this.getFamilyGroup(familyGroupId);
    if (group) return group.protectionSettings;
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

  async updateProtectionSettings(
    familyGroupId: string,
    settings: Partial<ProtectionSettings>
  ): Promise<ProtectionSettings> {
    const current = await this.getProtectionSettings(familyGroupId);
    return { ...current, ...settings };
  }

  async activateEmergencyLockdown(familyGroupId: string): Promise<FamilyGroup> {
    const res = await apiClient.post<BackendFamilyGroup>(`/family/group/${encodeURIComponent(familyGroupId)}/lockdown/activate`);
    return mapBackendToFamilyGroup(res);
  }

  async deactivateEmergencyLockdown(familyGroupId: string): Promise<FamilyGroup> {
    const res = await apiClient.post<BackendFamilyGroup>(`/family/group/${encodeURIComponent(familyGroupId)}/lockdown/deactivate`);
    return mapBackendToFamilyGroup(res);
  }

  async getAnalytics(familyGroupId: string): Promise<FamilyAnalytics> {
    const [threats, invites] = await Promise.all([
      this.getSharedThreatFeed(familyGroupId).catch(() => []),
      this.getInvites(familyGroupId).catch(() => []),
    ]);

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
      activeMembers: 1, // At minimum the owner
      pendingInvites: invites.length,
      deflectionRate,
      estimatedSavings: 0,
      linkChecksCount: linkChecks,
    };
  }
}

export const apiFamilyRepository = new ApiFamilyProtectionRepository();
