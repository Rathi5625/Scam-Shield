package com.scamshield.dto;

import jakarta.validation.constraints.NotBlank;

public record UrlScanRequest(
    @NotBlank(message = "URL cannot be blank")
    String url
) {}
