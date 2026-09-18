package com.scamshield.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ImageScanRequest(
    @Size(max = 512, message = "s3Key cannot exceed 512 characters")
    String s3Key,

    @Size(max = 7000000, message = "Base64 image data exceeds 5MB limit")
    String imageBase64,

    @Pattern(regexp = "^(image/png|image/jpeg|image/jpg|image/webp)?$", message = "Unsupported MIME type. Allowed: image/png, image/jpeg, image/webp")
    String mimeType
) {
    public ImageScanRequest(String s3Key) {
        this(s3Key, null, null);
    }
}
