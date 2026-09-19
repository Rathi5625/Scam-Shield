package com.scamshield.dto;

import com.scamshield.model.RiskLevel;
import com.scamshield.model.ScamCategory;

import java.util.List;

public record ScanResponse(
    String scanId,
    RiskLevel riskLevel,
    int riskScore,
    ScamCategory category,
    List<RedFlag> redFlags,
    String action,
    String createdAt,
    Double confidence,
    Double latencySeconds,
    String engineName,
    String summary,
    String explanation,
    List<String> indicators,
    UrlScanResponse urlForensics
) {
    /**
     * Backward-compatible constructor for existing MockScanService and legacy endpoints.
     * Defaults the AI-generated explanation fields and urlForensics to null.
     */
    public ScanResponse(
            String scanId,
            RiskLevel riskLevel,
            int riskScore,
            ScamCategory category,
            List<RedFlag> redFlags,
            String action,
            String createdAt) {
        this(scanId, riskLevel, riskScore, category, redFlags, action, createdAt, null, null, null, null, null, null, null);
    }

    /**
     * 10-arg constructor retained for backward-compat with GeminiScanService fallback paths
     * that pre-date the summary/explanation/indicators fields.
     */
    public ScanResponse(
            String scanId,
            RiskLevel riskLevel,
            int riskScore,
            ScamCategory category,
            List<RedFlag> redFlags,
            String action,
            String createdAt,
            Double confidence,
            Double latencySeconds,
            String engineName) {
        this(scanId, riskLevel, riskScore, category, redFlags, action, createdAt, confidence, latencySeconds, engineName, null, null, null, null);
    }

    /**
     * 13-arg constructor retaining backward-compat with calls not specifying urlForensics.
     */
    public ScanResponse(
            String scanId,
            RiskLevel riskLevel,
            int riskScore,
            ScamCategory category,
            List<RedFlag> redFlags,
            String action,
            String createdAt,
            Double confidence,
            Double latencySeconds,
            String engineName,
            String summary,
            String explanation,
            List<String> indicators) {
        this(scanId, riskLevel, riskScore, category, redFlags, action, createdAt, confidence, latencySeconds, engineName, summary, explanation, indicators, null);
    }
}
