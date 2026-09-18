import type { RiskLevel, ScanResponse, UrlScanResponse } from './api';

export type ScanType = 'TEXT' | 'SCREENSHOT' | 'LINK';

export interface HistorySourceMetadata {
  previewSnippet?: string; // Sanitized & truncated text representation (max 140 chars)
  filename?: string;       // Screenshot filename only (NO image binary/base64)
  url?: string;            // Target destination URL (stripped of sensitive token params)
}

export interface HistoryRecord {
  id: string;
  scannedAt: string;       // ISO 8601 string
  scanType: ScanType;
  riskLevel: RiskLevel;
  riskScore: number;       // 0 - 100 Threat Index
  category: string;        // E.g. 'BANKING_KYC', 'JOB_SCAM', 'URL_INSPECTION'
  summary: string;         // Headline / summary of the threat
  originalResult: ScanResponse | UrlScanResponse;
  sourceMetadata?: HistorySourceMetadata;
  userId?: string; // Scoped operative ID (Phase 5)
}

export type RiskFilter = 'ALL' | RiskLevel;
export type ScanTypeFilter = 'ALL' | ScanType;
export type DateRangeFilter = 'ALL' | 'TODAY' | '7_DAYS' | '30_DAYS';
export type SortOption = 'NEWEST' | 'OLDEST' | 'THREAT_HIGHEST';

export interface HistoryFilters {
  scanType: ScanTypeFilter;
  riskLevel: RiskFilter;
  dateRange: DateRangeFilter;
  searchQuery: string;
  sortBy: SortOption;
}

export interface ThreatAnalytics {
  totalScans: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  unknownRiskCount: number;
  averageRiskScore: number;
  deflectionAccuracy: number; // Percentage of high + medium threats out of total
  topCategory: string;
  topScanType: ScanType | 'NONE';
}
