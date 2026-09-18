package com.scamshield.dto;

import com.scamshield.model.RedFlagType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RedFlag(
    @NotNull(message = "Red flag type is required")
    RedFlagType type,

    @NotBlank(message = "Label is required")
    String label,

    @Min(0) @Max(100)
    int score
) {}
