package com.scamshield.dto;

public record ErrorResponse(
    String error,
    String message,
    String timestamp
) {}
