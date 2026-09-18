/**
 * Shared API and AI Specification contracts
 * Matches backend DTOs, AI_SPEC.md §2-§4, and API.md
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';

export type ScamCategory =
  | 'BANKING_KYC'
  | 'UPI_PAYMENT'
  | 'LOTTERY_PRIZE'
  | 'JOB_SCAM'
  | 'DELIVERY_SCAM'
  | 'RENTAL_SCAM'
  | 'ROMANCE_SCAM'
  | 'GOVERNMENT_IMPERSONATION'
  | 'SIM_KYC_FRAUD'
  | 'INVESTMENT_SCAM'
  | 'SCHOLARSHIP_SCAM'
  | 'PHISHING'
  | 'OTHER';

export type RedFlagType =
  | 'URGENCY'
  | 'FINANCIAL_REQUEST'
  | 'IMPERSONATION'
  | 'SUSPICIOUS_LINK'
  | 'SENSITIVE_INFO_REQUEST'
  | 'GRAMMAR_INCONSISTENCY'
  | 'UNSOLICITED_CONTACT'
  | 'TOO_GOOD_TO_BE_TRUE';

export interface RedFlag {
  type: RedFlagType;
  label: string;
  score: number;
}

export interface ScanResponse {
  scanId: string;
  riskLevel: RiskLevel;
  riskScore: number;
  category: ScamCategory;
  redFlags: RedFlag[];
  action: string;
  createdAt: string;

  // Frontend telemetry additions
  confidence?: number;
  latencySeconds?: number;
  engineName?: string;
}

export interface TextScanRequest {
  text: string;
}

export interface ImageScanRequest {
  s3Key: string;
  imageBase64?: string;
  mimeType?: string;
}

export interface UrlScanRequest {
  url: string;
}

export interface UrlScanResponse {
  scanId: string;
  verdict: 'SAFE' | 'SUSPICIOUS' | 'HIGH_RISK' | string;
  reasons: string[];
  createdAt: string;
}

export interface ApiError {
  error: string;
  message: string;
  timestamp?: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  mode: string;
  timestamp: string;
}
