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
    String engineName
) {
    /**
     * Backward-compatible constructor for existing MockScanService and legacy endpoints.
     */
    public ScanResponse(
            String scanId,
            RiskLevel riskLevel,
            int riskScore,
            ScamCategory category,
            List<RedFlag> redFlags,
            String action,
            String createdAt) {
        this(scanId, riskLevel, riskScore, category, redFlags, action, createdAt, null, null, null);
    }
}
