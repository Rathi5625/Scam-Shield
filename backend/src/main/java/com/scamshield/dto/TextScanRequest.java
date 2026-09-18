package com.scamshield.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TextScanRequest(
    @NotBlank(message = "Message text cannot be empty")
    @Size(max = 10000, message = "Message text cannot exceed 10,000 characters")
    String text
) {}
