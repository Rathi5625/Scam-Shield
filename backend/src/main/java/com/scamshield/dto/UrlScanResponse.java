package com.scamshield.dto;

import java.util.List;

/**
 * Response for URL/Link Shield forensic analysis.
 * riskScore is always computed by UrlForensicAnalyzer (deterministic lexical engine)
 * and is never hardcoded. The legacy 4-arg constructor that hardcoded scores of 12/84
 * has been removed (FIX 7).
 */
public record UrlScanResponse(
    String scanId,
    String verdict,
    List<String> reasons,
    String createdAt,
    Integer riskScore,
    String url
) {
    public UrlScanResponse(String scanId, String verdict, List<String> reasons, String createdAt, Integer riskScore) {
        this(scanId, verdict, reasons, createdAt, riskScore, null);
    }
}
