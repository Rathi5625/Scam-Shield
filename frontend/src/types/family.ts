import type { RiskLevel } from './api';

export type FamilyRole = 'OWNER' | 'MEMBER';
export type FamilyMemberStatus = 'ACTIVE' | 'PENDING' | 'DECLINED';

export interface FamilyMember {
  id: string;
  userId?: string;
  displayName: string;
  email: string;
  role: FamilyRole;
  status: FamilyMemberStatus;
  joinedAt: string;
  relationship?: string; // e.g. 'Mom', 'Dad', 'Brother', 'Spouse', 'Child'
  deviceInfo?: string;   // e.g. 'iPhone 15 Pro', 'Pixel 8 & macOS', 'Windows PC'
  defenseState?: 'ALL CLEAR' | 'ATTENTION REQUIRED' | 'PROTECTED';
  activeThreatsCount?: number;
  avatarUrl?: string;
}

export interface ProtectionSettings {
  aggressivePhishing: boolean;
  realTimeHeuristics: boolean;
  familyAlerts: boolean;
  ephemeralLogging: boolean;
  emergencyLockdown: boolean;
  instantSmsAlerts?: boolean;
  silentQuarantine?: boolean;
}

export interface FamilyGroup {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string;
  emergencyLockdownActive: boolean;
  emergencyLockdownActivatedAt?: string;
  members: FamilyMember[];
  protectionSettings: ProtectionSettings;
}

export interface FamilyInvite {
  id: string;
  familyGroupId: string;
  email: string;
  invitedBy: string;
  createdAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  relationship?: string;
}

export interface ThreatShare {
  id: string;
  familyGroupId: string;
  sharedBy: string; // Member display name or ID
  scanType: 'TEXT' | 'SCREENSHOT' | 'LINK';
  riskLevel: RiskLevel;
  riskScore: number;
  category: string;
  summary: string;  // Sanitized summary preview (zero PII)
  createdAt: string;
  vector?: string;  // e.g. 'SMS Gate', 'Parcel Tracking SMS', 'Inbound Email', 'URL Inspection'
  exposureStatus?: 'Zero Exposure' | 'Warned User' | 'Verified Authentic';
  targetDomain?: string;
}

export interface FamilyAnalytics {
  totalSharedThreats: number;
  highRiskThreats: number;
  mediumRiskThreats: number;
  lowRiskThreats: number;
  activeMembers: number;
  pendingInvites: number;
  deflectionRate: number;
  estimatedSavings: number;
  linkChecksCount: number;
}
