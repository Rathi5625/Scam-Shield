package com.scamshield.service.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Amazon S3 Cloud Implementation of ObjectStorageService.
 * Enforces AES256 server-side encryption, strictly private object ACLs,
 * safe key generation partitioned by verified user identity, and pre-signed access URLs.
 */
@Service
@ConditionalOnProperty(name = "storage.mode", havingValue = "S3")
public class S3ObjectStorageService implements ObjectStorageService {

    private static final Logger log = LoggerFactory.getLogger(S3ObjectStorageService.class);

    private static final Set<String> ALLOWED_MIMES = Set.of(
            "image/png", "image/jpeg", "image/jpg", "image/webp"
    );

    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket-name:}")
    private String bucketName;

    @Autowired
    public S3ObjectStorageService(S3Client s3Client, S3Presigner s3Presigner) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
    }

    public S3ObjectStorageService(S3Client s3Client, S3Presigner s3Presigner, String bucketName) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.bucketName = bucketName;
    }

    @Override
    public StoredObject storeObject(String userId, byte[] bytes, String mimeType, boolean temporary) {
        if (bytes == null || bytes.length == 0) {
            throw new IllegalArgumentException("Payload bytes cannot be empty");
        }
        if (bytes.length > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException("Payload size " + bytes.length + " bytes exceeds maximum 5MB limit");
        }

        String normalizedMime = (mimeType != null) ? mimeType.trim().toLowerCase(Locale.ROOT) : "";
        if (!ALLOWED_MIMES.contains(normalizedMime)) {
            throw new IllegalArgumentException("Unsupported media type: " + mimeType + ". Allowed: PNG, JPEG, WEBP");
        }

        LocalObjectStorageService.validateImageSignature(bytes, normalizedMime);

        if (bucketName == null || bucketName.isBlank()) {
            throw new IllegalStateException("S3 bucket name is not configured (aws.s3.bucket-name is empty)");
        }

        String safeUserSub = sanitizePathSegment(userId != null ? userId : "anonymous");
        String extension = getExtensionForMime(normalizedMime);
        String randomId = UUID.randomUUID().toString();
        String objectKey = "private/" + safeUserSub + "/" + randomId + "." + extension;

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .contentType(normalizedMime)
                    .serverSideEncryption(ServerSideEncryption.AES256)
                    .tagging(Tagging.builder().tagSet(
                            Tag.builder().key("temporary").value(String.valueOf(temporary)).build(),
                            Tag.builder().key("uploadedAt").value(Instant.now().toString()).build()
                    ).build())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromBytes(bytes));
            log.info("Uploaded private object to S3: s3://{}/{} (bytes: {}, mime: {})",
                    bucketName, objectKey, bytes.length, normalizedMime);

            return new StoredObject(objectKey, normalizedMime, bytes.length, temporary, "S3");

        } catch (S3Exception e) {
            log.error("S3 upload failed for key {}: HTTP {} - {}", objectKey, e.statusCode(), e.awsErrorDetails().errorMessage());
            throw new RuntimeException("S3 upload failure: " + e.awsErrorDetails().errorMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error uploading to S3: {}", e.getMessage());
            throw new RuntimeException("Object storage error: " + e.getMessage(), e);
        }
    }

    @Override
    public Optional<StoredObjectMetadata> getMetadata(String objectKey) {
        if (objectKey == null || objectKey.isBlank() || bucketName == null || bucketName.isBlank()) {
            return Optional.empty();
        }

        try {
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();

            HeadObjectResponse response = s3Client.headObject(headRequest);
            StoredObjectMetadata meta = new StoredObjectMetadata(
                    objectKey,
                    response.contentType(),
                    response.contentLength(),
                    response.lastModified() != null ? response.lastModified().toString() : Instant.now().toString(),
                    true
            );
            return Optional.of(meta);

        } catch (NoSuchKeyException e) {
            return Optional.empty();
        } catch (Exception e) {
            log.warn("Failed to retrieve S3 metadata for key {}: {}", objectKey, e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public Optional<String> generateAccessUrl(String objectKey, Duration duration) {
        if (objectKey == null || objectKey.isBlank() || bucketName == null || bucketName.isBlank() || s3Presigner == null) {
            return Optional.empty();
        }

        try {
            // Bound presigned duration: min 1 minute, max 15 minutes
            Duration safeDuration = duration != null && !duration.isNegative()
                    ? Duration.ofSeconds(Math.min(900, Math.max(60, duration.toSeconds())))
                    : Duration.ofMinutes(15);

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(safeDuration)
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presigned = s3Presigner.presignGetObject(presignRequest);
            return Optional.of(presigned.url().toString());

        } catch (Exception e) {
            log.warn("Failed to generate presigned S3 URL for {}: {}", objectKey, e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public boolean deleteObject(String objectKey) {
        if (objectKey == null || objectKey.isBlank() || bucketName == null || bucketName.isBlank()) {
            return false;
        }

        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();

            s3Client.deleteObject(deleteRequest);
            log.info("Deleted S3 object: s3://{}/{}", bucketName, objectKey);
            return true;
        } catch (Exception e) {
            log.warn("Failed to delete S3 object {}: {}", objectKey, e.getMessage());
            return false;
        }
    }

    private String sanitizePathSegment(String raw) {
        return raw.replaceAll("[^a-zA-Z0-9_-]", "_");
    }

    private String getExtensionForMime(String mime) {
        return switch (mime) {
            case "image/jpeg", "image/jpg" -> "jpg";
            case "image/webp" -> "webp";
            default -> "png";
        };
    }
}
