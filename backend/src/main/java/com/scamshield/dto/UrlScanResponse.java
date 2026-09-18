package com.scamshield.dto;

import java.util.List;

public record UrlScanResponse(
    String scanId,
    String verdict,
    List<String> reasons,
    String createdAt
) {}
