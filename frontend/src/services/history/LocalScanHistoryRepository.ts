import type { HistoryRecord, ThreatAnalytics, ScanType } from '../../types/history';
import type { ScanResponse, UrlScanResponse, RiskLevel } from '../../types/api';
import type { ScanHistoryRepository } from './ScanHistoryRepository';

const STORAGE_KEY = 'scamshield_scan_history_v1';
const MAX_PREVIEW_LENGTH = 140;

/**
 * Strips sensitive PII patterns (OTPs, PINs, Passwords, Card numbers) from text previews
 */
export function sanitizeTextPreview(input: string): string {
  if (!input) return '';

  return input
    // Mask OTPs and verification codes (supports optional "is", "was", ":", "=", etc.)
    .replace(/\b(?:otp|one[- ]?time[- ]?password|code|verification[- ]?code)(?:\s+(?:is|was|number|code))?\s*[:=]?\s*(\d{4,8})\b/gi, 'OTP: [REDACTED]')
    // Mask PINs (supports optional "is", "was", etc.)
    .replace(/\b(?:pin|mpin)(?:\s+(?:is|was|number|code))?\s*[:=]?\s*(\d{4,6})\b/gi, 'PIN: [REDACTED]')
    // Mask passwords
    .replace(/\b(?:password|passwd)\s*(?:is|was)?\s*[:=]?\s*(\S+)/gi, 'Password: [REDACTED]')
    // Mask credit/debit card numbers
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, '•••• •••• •••• [REDACTED]')
    // Truncate to safe display length
    .slice(0, MAX_PREVIEW_LENGTH)
    .trim();
}

/**
 * Strips sensitive authentication and token query parameters from destination URLs
 */
export function sanitizeUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  try {
    const urlObj = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    const sensitiveParams = ['token', 'auth', 'key', 'code', 'secret', 'jwt', 'session', 'pwd', 'password', 'otp'];
    sensitiveParams.forEach((param) => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, 'REDACTED');
      }
    });
    return urlObj.toString();
  } catch {
    return rawUrl.slice(0, 100);
  }
}

/**
 * Creates a HistoryRecord from a completed Text Scan
 */
export function createRecordFromTextScan(response: ScanResponse, rawText: string): HistoryRecord {
  const sanitizedSnippet = sanitizeTextPreview(rawText);
  return {
    id: response.scanId || `txt_${Date.now()}`,
    scannedAt: response.createdAt || new Date().toISOString(),
    scanType: 'TEXT',
    riskLevel: response.riskLevel,
    riskScore: response.riskScore,
    category: response.category,
    summary: response.action || `${response.category.replace(/_/g, ' ')} Threat Pattern`,
    originalResult: response,
    sourceMetadata: {
      previewSnippet: sanitizedSnippet,
    },
  };
}

/**
 * Creates a HistoryRecord from a completed Screenshot Scan
 * Strictly stores filename metadata — NEVER binary image buffers
 */
export function createRecordFromImageScan(response: ScanResponse, filename: string): HistoryRecord {
  const cleanFilename = filename ? filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80) : 'screenshot.png';
  return {
    id: response.scanId || `img_${Date.now()}`,
    scannedAt: response.createdAt || new Date().toISOString(),
    scanType: 'SCREENSHOT',
    riskLevel: response.riskLevel,
    riskScore: response.riskScore,
    category: response.category,
    summary: response.action || `Visual Forensics: ${cleanFilename}`,
    originalResult: response,
    sourceMetadata: {
      filename: cleanFilename,
      previewSnippet: `[OCR Capture: ${cleanFilename}]`,
    },
  };
}

/**
 * Creates a HistoryRecord from a completed Link Shield Scan
 */
export function createRecordFromUrlScan(response: UrlScanResponse, rawUrl: string): HistoryRecord {
  const sanitized = sanitizeUrl(rawUrl);
  let riskLevel: RiskLevel = 'UNKNOWN';
  if (response.verdict === 'SAFE') riskLevel = 'LOW';
  else if (response.verdict === 'SUSPICIOUS') riskLevel = 'MEDIUM';
  else if (response.verdict === 'HIGH_RISK') riskLevel = 'HIGH';

  const riskScore = riskLevel === 'HIGH' ? 88 : riskLevel === 'MEDIUM' ? 62 : 12;
  const reasonSummary = response.reasons?.[0] || 'Static Lexical Inspection';

  return {
    id: response.scanId || `url_${Date.now()}`,
    scannedAt: response.createdAt || new Date().toISOString(),
    scanType: 'LINK',
    riskLevel,
    riskScore,
    category: 'PHISHING',
    summary: reasonSummary,
    originalResult: response,
    sourceMetadata: {
      url: sanitized,
      previewSnippet: sanitized,
    },
  };
}

/**
 * Calculates ThreatAnalytics metrics from stored history records
 */
export function calculateThreatAnalytics(records: HistoryRecord[]): ThreatAnalytics {
  const totalScans = records.length;
  if (totalScans === 0) {
    return {
      totalScans: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
      unknownRiskCount: 0,
      averageRiskScore: 0,
      deflectionAccuracy: 0,
      topCategory: 'None',
      topScanType: 'NONE',
    };
  }

  let highCount = 0;
  let medCount = 0;
  let lowCount = 0;
  let unkCount = 0;
  let scoreSum = 0;

  const categoryFrequency: Record<string, number> = {};
  const typeFrequency: Record<ScanType, number> = { TEXT: 0, SCREENSHOT: 0, LINK: 0 };

  records.forEach((record) => {
    scoreSum += record.riskScore || 0;
    if (record.riskLevel === 'HIGH') highCount++;
    else if (record.riskLevel === 'MEDIUM') medCount++;
    else if (record.riskLevel === 'LOW') lowCount++;
    else unkCount++;

    if (record.category) {
      categoryFrequency[record.category] = (categoryFrequency[record.category] || 0) + 1;
    }
    if (record.scanType) {
      typeFrequency[record.scanType] = (typeFrequency[record.scanType] || 0) + 1;
    }
  });

  // Calculate top category
  let topCategory = 'General Threat';
  let maxCatCount = -1;
  for (const [cat, count] of Object.entries(categoryFrequency)) {
    if (count > maxCatCount) {
      maxCatCount = count;
      topCategory = cat.replace(/_/g, ' ');
    }
  }

  // Calculate top scan type
  let topScanType: ScanType = 'TEXT';
  let maxTypeCount = -1;
  for (const [type, count] of Object.entries(typeFrequency) as [ScanType, number][]) {
    if (count > maxTypeCount) {
      maxTypeCount = count;
      topScanType = type;
    }
  }

  const deflectedCount = highCount + medCount;
  const deflectionAccuracy = Math.round((deflectedCount / totalScans) * 100);
  const averageRiskScore = Math.round(scoreSum / totalScans);

  return {
    totalScans,
    highRiskCount: highCount,
    mediumRiskCount: medCount,
    lowRiskCount: lowCount,
    unknownRiskCount: unkCount,
    averageRiskScore,
    deflectionAccuracy,
    topCategory,
    topScanType,
  };
}

function getActiveUserId(): string | null {
  try {
    const raw = localStorage.getItem('scamshield_session_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id || parsed?.user?.id || null;
  } catch {
    return null;
  }
}

/**
 * LocalScanHistoryRepository implementation
 */
export class LocalScanHistoryRepository implements ScanHistoryRepository {
  private readStorage(): HistoryRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (item) => item && typeof item === 'object' && item.id && item.riskLevel && item.scannedAt
      );
    } catch {
      console.warn('ScamShield: Local history storage inaccessible or corrupt.');
      return [];
    }
  }

  private writeStorage(records: HistoryRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      console.warn('ScamShield: Failed to persist record to local storage.');
    }
  }

  async saveScan(record: HistoryRecord): Promise<void> {
    const existing = this.readStorage();
    const activeUserId = getActiveUserId();
    const recordToSave: HistoryRecord = {
      ...record,
      userId: record.userId || activeUserId || undefined,
    };
    // Filter out if record already exists with same id to update or avoid duplicates
    const filtered = existing.filter((item) => item.id !== recordToSave.id);
    const updated = [recordToSave, ...filtered];
    this.writeStorage(updated);
  }

  async getAllScans(): Promise<HistoryRecord[]> {
    const records = this.readStorage();
    const activeUserId = getActiveUserId();
    // Filter by active user while preserving legacy records without userId
    const scopedRecords = activeUserId
      ? records.filter((r) => !r.userId || r.userId === activeUserId)
      : records;
    // Sort descending by scannedAt date
    return scopedRecords.sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());
  }

  async getScanById(id: string): Promise<HistoryRecord | null> {
    const records = this.readStorage();
    const match = records.find((item) => item.id === id);
    return match || null;
  }

  async deleteScan(id: string): Promise<boolean> {
    const records = this.readStorage();
    const initialLength = records.length;
    const filtered = records.filter((item) => item.id !== id);
    if (filtered.length === initialLength) return false;
    this.writeStorage(filtered);
    return true;
  }

  async clearAllScans(): Promise<void> {
    try {
      const activeUserId = getActiveUserId();
      if (!activeUserId) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        // Scoped purge: retain records belonging to other users
        const records = this.readStorage();
        const remaining = records.filter((r) => r.userId && r.userId !== activeUserId);
        this.writeStorage(remaining);
      }
    } catch {
      console.warn('ScamShield: Failed to clear local history.');
    }
  }
}

// Export local singleton and dynamic environment-aware repository
import { apiScanHistoryRepository } from './ApiScanHistoryRepository';

export const localHistoryRepository = new LocalScanHistoryRepository();

export const historyRepository: ScanHistoryRepository =
  import.meta.env.VITE_DATA_MODE === 'API'
    ? apiScanHistoryRepository
    : localHistoryRepository;

