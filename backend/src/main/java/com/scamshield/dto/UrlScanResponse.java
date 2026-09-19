package com.scamshield.dto;

import java.util.List;

public record UrlScanResponse(
    String scanId,
    String verdict,
    List<String> reasons,
    String createdAt,
    Integer riskScore
) {
    public UrlScanResponse(String scanId, String verdict, List<String> reasons, String createdAt) {
        this(scanId, verdict, reasons, createdAt, "SAFE".equalsIgnoreCase(verdict) ? 12 : 84);
    }
}

