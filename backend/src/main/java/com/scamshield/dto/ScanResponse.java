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
    String createdAt
) {}
