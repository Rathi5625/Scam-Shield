import type {
  FamilyGroup,
  FamilyMember,
  FamilyInvite,
  ThreatShare,
  ProtectionSettings,
  FamilyRole,
  FamilyAnalytics,
} from '../../types/family';

/**
 * FamilyProtectionRepository
 * Abstract contract for family defense groups, member management,
 * threat activity feeds, and emergency lockdowns.
 * Local implementations use browser localStorage.
 * Future cloud implementations will route to Spring Boot / DynamoDB / SNS without modifying UI layers.
 */
export interface FamilyProtectionRepository {
  getFamilyGroup(userId: string): Promise<FamilyGroup | null>;
  createFamilyGroup(
    userId: string,
    groupName: string,
    ownerName: string,
    ownerEmail: string
  ): Promise<FamilyGroup>;
  inviteMember(
    familyGroupId: string,
    invitedBy: string,
    email: string,
    relationship?: string
  ): Promise<FamilyInvite>;
  getInvites(familyGroupId: string): Promise<FamilyInvite[]>;
  acceptInvite(
    inviteId: string,
    memberDisplayName: string,
    memberUserId?: string
  ): Promise<FamilyMember>;
  declineInvite(inviteId: string): Promise<boolean>;
  removeMember(
    familyGroupId: string,
    memberId: string,
    requesterUserId: string
  ): Promise<boolean>;
  updateMemberRole(
    familyGroupId: string,
    memberId: string,
    newRole: FamilyRole,
    requesterUserId: string
  ): Promise<boolean>;
  getSharedThreatFeed(familyGroupId: string): Promise<ThreatShare[]>;
  shareThreat(
    threat: Omit<ThreatShare, 'id' | 'createdAt'>
  ): Promise<ThreatShare>;
  getProtectionSettings(familyGroupId: string): Promise<ProtectionSettings>;
  updateProtectionSettings(
    familyGroupId: string,
    settings: Partial<ProtectionSettings>
  ): Promise<ProtectionSettings>;
  activateEmergencyLockdown(familyGroupId: string): Promise<FamilyGroup>;
  deactivateEmergencyLockdown(familyGroupId: string): Promise<FamilyGroup>;
  getAnalytics(familyGroupId: string): Promise<FamilyAnalytics>;
}
