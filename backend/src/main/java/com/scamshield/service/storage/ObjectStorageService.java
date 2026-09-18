package com.scamshield.service.storage;

import java.time.Duration;
import java.util.Optional;

/**
 * Minimal, secure abstraction for object storage (screenshots and threat artifacts).
 * Supports both LocalObjectStorageService and S3ObjectStorageService.
 */
public interface ObjectStorageService {

    record StoredObject(
            String objectKey,
            String mimeType,
            long sizeBytes,
            boolean temporary,
            String storageMode
    ) {}

    record StoredObjectMetadata(
            String objectKey,
            String mimeType,
            long sizeBytes,
            String createdAt,
            boolean temporary
    ) {}

    /**
     * Stores an object (e.g. screenshot) under a securely partitioned user path.
     *
     * @param userId Authenticated user identifier (e.g. Cognito sub) or anonymous
     * @param bytes Raw payload bytes (must be <= 5MB)
     * @param mimeType Allowed MIME type (image/png, image/jpeg, image/webp)
     * @param temporary Whether this object is ephemeral or persisted
     * @return StoredObject record with generated secure key and metadata
     */
    StoredObject storeObject(String userId, byte[] bytes, String mimeType, boolean temporary);

    /**
     * Retrieves metadata for a stored object key.
     */
    Optional<StoredObjectMetadata> getMetadata(String objectKey);

    /**
     * Generates a time-limited secure access URL.
     */
    Optional<String> generateAccessUrl(String objectKey, Duration duration);

    /**
     * Safely deletes an object by key.
     */
    boolean deleteObject(String objectKey);
}
