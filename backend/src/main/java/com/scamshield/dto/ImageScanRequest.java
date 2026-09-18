package com.scamshield.dto;

import jakarta.validation.constraints.NotBlank;

public record ImageScanRequest(
    @NotBlank(message = "S3 key cannot be blank")
    String s3Key
) {}
