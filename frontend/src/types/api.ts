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
  confidence?: number;        // null when no real analysis was performed (FIX 2)
  latencySeconds?: number;
  engineName?: string;

  // FIX 6: AI-generated explanation fields from Gemini response
  summary?: string;           // One-sentence threat summary from Gemini
  explanation?: string;       // Detailed explanation of threat reasoning
  indicators?: string[];      // Key phrases / evidence tokens Gemini identified

  // Deterministic URL forensic findings from UrlForensicAnalyzer
  urlForensics?: UrlScanResponse;
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
  riskScore?: number;
  url?: string;
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
