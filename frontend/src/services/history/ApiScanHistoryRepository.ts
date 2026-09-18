import type { HistoryRecord, ScanType } from '../../types/history';
import type { RiskLevel, ScanResponse, UrlScanResponse, ScamCategory, RedFlagType, RedFlag } from '../../types/api';
import type { ScanHistoryRepository } from './ScanHistoryRepository';
import { apiClient } from '../api/apiClient';

interface BackendScanItem {
  scanId: string;
  userId: string;
  scanType: string;
  inputSummary: string;
  riskLevel: string;
  riskScore: number;
  category: string;
  redFlags?: Array<{ type?: string; label?: string; score?: number }>;
  action?: string;
  groupId?: string;
  sharedBy?: string;
  s3Key?: string;
  createdAt: string;
}

interface BackendScanListResponse {
  items: BackendScanItem[];
  totalCount: number;
  nextCursor?: string;
}

function getActiveUserId(): string {
  try {
    const sessionData = localStorage.getItem('scamshield_active_session');
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      if (parsed.user?.id) return parsed.user.id;
    }
  } catch {
    // ignore
  }
  return 'usr_demo_sentinel';
}

function parseCategory(raw?: string): ScamCategory {
  if (!raw) return 'OTHER';
  const normalized = raw.toUpperCase().replace(/\s+/g, '_');
  const valid: ScamCategory[] = [
    'BANKING_KYC',
    'UPI_PAYMENT',
    'LOTTERY_PRIZE',
    'JOB_SCAM',
    'DELIVERY_SCAM',
    'RENTAL_SCAM',
    'ROMANCE_SCAM',
    'GOVERNMENT_IMPERSONATION',
    'SIM_KYC_FRAUD',
    'INVESTMENT_SCAM',
    'SCHOLARSHIP_SCAM',
    'PHISHING',
    'OTHER',
  ];
  return valid.includes(normalized as ScamCategory) ? (normalized as ScamCategory) : 'OTHER';
}

function parseRedFlagType(raw?: string): RedFlagType {
  if (!raw) return 'UNSOLICITED_CONTACT';
  const normalized = raw.toUpperCase().replace(/\s+/g, '_');
  const valid: RedFlagType[] = [
    'URGENCY',
    'FINANCIAL_REQUEST',
    'IMPERSONATION',
    'SUSPICIOUS_LINK',
    'SENSITIVE_INFO_REQUEST',
    'GRAMMAR_INCONSISTENCY',
    'UNSOLICITED_CONTACT',
    'TOO_GOOD_TO_BE_TRUE',
  ];
  return valid.includes(normalized as RedFlagType) ? (normalized as RedFlagType) : 'UNSOLICITED_CONTACT';
}

function mapBackendToHistoryRecord(item: BackendScanItem): HistoryRecord {
  const flags: RedFlag[] = (item.redFlags || []).map((f) => ({
    type: parseRedFlagType(f.type),
    label: f.label || 'Suspicious indicator',
    score: f.score ?? 50,
  }));

  const scanType: ScanType =
    item.scanType === 'IMAGE' || item.scanType === 'SCREENSHOT'
      ? 'SCREENSHOT'
      : item.scanType === 'URL' || item.scanType === 'LINK'
      ? 'LINK'
      : 'TEXT';

  const riskLevel = (item.riskLevel || 'LOW') as RiskLevel;
  const category = parseCategory(item.category);

  let originalResult: ScanResponse | UrlScanResponse;
  if (scanType === 'LINK') {
    originalResult = {
      scanId: item.scanId,
      verdict: riskLevel === 'HIGH' ? 'MALICIOUS' : riskLevel === 'MEDIUM' ? 'SUSPICIOUS' : 'SAFE',
      reasons: flags.map((f) => f.label),
      createdAt: item.createdAt,
    };
  } else {
    originalResult = {
      scanId: item.scanId,
      riskLevel,
      riskScore: item.riskScore ?? 0,
      category,
      redFlags: flags,
      action: item.action || 'No action required.',
      createdAt: item.createdAt,
    };
  }

  return {
    id: item.scanId,
    userId: item.userId,
    scannedAt: item.createdAt || new Date().toISOString(),
    scanType,
    riskLevel,
    riskScore: item.riskScore ?? 0,
    category: item.category || 'General Analysis',
    summary: item.inputSummary || '',
    originalResult,
    sourceMetadata: {
      previewSnippet: item.inputSummary,
      filename: item.s3Key,
    },
  };
}

export class ApiScanHistoryRepository implements ScanHistoryRepository {
  async saveScan(record: HistoryRecord): Promise<void> {
    const userId = record.userId || getActiveUserId();
    const flags = 'redFlags' in record.originalResult ? record.originalResult.redFlags : [];
    const action = 'action' in record.originalResult ? record.originalResult.action : undefined;

    await apiClient.post('/history', {
      userId,
      scanType: record.scanType,
      inputSummary: record.summary || record.sourceMetadata?.previewSnippet || 'Scanned item',
      riskLevel: record.riskLevel,
      riskScore: record.riskScore,
      category: record.category,
      redFlags: flags,
      action: action || 'Review threat report',
      s3Key: record.sourceMetadata?.filename,
    });
  }

  async getAllScans(): Promise<HistoryRecord[]> {
    const userId = getActiveUserId();
    try {
      const res = await apiClient.get<BackendScanListResponse>('/history', {
        userId,
        limit: 100,
      });
      return (res.items || []).map(mapBackendToHistoryRecord);
    } catch (e) {
      console.warn('ScamShield API: Failed to fetch scans, returning empty list:', e);
      return [];
    }
  }

  async getScanById(id: string): Promise<HistoryRecord | null> {
    const userId = getActiveUserId();
    try {
      const item = await apiClient.get<BackendScanItem>(`/history/${encodeURIComponent(id)}`, {
        userId,
      });
      return item ? mapBackendToHistoryRecord(item) : null;
    } catch {
      return null;
    }
  }

  async deleteScan(id: string): Promise<boolean> {
    const userId = getActiveUserId();
    try {
      await apiClient.delete(`/history/${encodeURIComponent(id)}`, { userId });
      return true;
    } catch {
      return false;
    }
  }

  async clearAllScans(): Promise<void> {
    const userId = getActiveUserId();
    try {
      await apiClient.delete('/history', { userId });
    } catch (e) {
      console.warn('ScamShield API: Failed to clear scans:', e);
    }
  }
}

export const apiScanHistoryRepository = new ApiScanHistoryRepository();
