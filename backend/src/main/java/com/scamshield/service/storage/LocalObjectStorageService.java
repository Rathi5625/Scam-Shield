package com.scamshield.service.storage;

import com.scamshield.config.LocalStorageProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Local sandbox implementation of ObjectStorageService.
 * Requires zero AWS credentials, strictly prevents path traversal,
 * and enforces the 5MB size limit and allowed MIME types.
 */
@Service
@ConditionalOnProperty(name = "storage.mode", havingValue = "LOCAL", matchIfMissing = true)
public class LocalObjectStorageService implements ObjectStorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalObjectStorageService.class);

    private static final Set<String> ALLOWED_MIMES = Set.of(
            "image/png", "image/jpeg", "image/jpg", "image/webp"
    );

    private final LocalStorageProperties properties;
    private final Path storageRoot;
    private final Map<String, StoredObjectMetadata> metadataRegistry = new ConcurrentHashMap<>();

    public LocalObjectStorageService(LocalStorageProperties properties) {
        this.properties = properties;
        this.storageRoot = Paths.get(properties.getBaseDir()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageRoot);
            log.info("Initialized LocalObjectStorageService at root: {}", this.storageRoot);
        } catch (IOException e) {
            log.warn("Could not create local storage directory {}: {}", this.storageRoot, e.getMessage());
        }
    }

    @Override
    public StoredObject storeObject(String userId, byte[] bytes, String mimeType, boolean temporary) {
        if (bytes == null || bytes.length == 0) {
            throw new IllegalArgumentException("Payload bytes cannot be empty");
        }
        if (bytes.length > properties.getMaxSizeBytes()) {
            throw new IllegalArgumentException("Payload size " + bytes.length + " bytes exceeds maximum 5MB limit");
        }

        String normalizedMime = (mimeType != null) ? mimeType.trim().toLowerCase(Locale.ROOT) : "";
        if (!ALLOWED_MIMES.contains(normalizedMime)) {
            throw new IllegalArgumentException("Unsupported media type: " + mimeType + ". Allowed: PNG, JPEG, WEBP");
        }

        validateImageSignature(bytes, normalizedMime);

        String safeUserSub = sanitizePathSegment(userId != null ? userId : "anonymous");
        String extension = getExtensionForMime(normalizedMime);
        String randomId = UUID.randomUUID().toString();
        String objectKey = "private/" + safeUserSub + "/" + randomId + "." + extension;

        Path targetPath = resolveSafePath(objectKey);
        try {
            Files.createDirectories(targetPath.getParent());
            Files.write(targetPath, bytes);

            StoredObjectMetadata meta = new StoredObjectMetadata(
                    objectKey,
                    normalizedMime,
                    bytes.length,
                    Instant.now().toString(),
                    temporary
            );
            metadataRegistry.put(objectKey, meta);

            log.debug("Stored local object key={} (bytes: {}, mime: {})", objectKey, bytes.length, normalizedMime);
            return new StoredObject(objectKey, normalizedMime, bytes.length, temporary, "LOCAL");

        } catch (IOException e) {
            log.error("Failed to write local object {}: {}", objectKey, e.getMessage());
            throw new RuntimeException("Storage failure writing local object: " + e.getMessage(), e);
        }
    }

    @Override
    public Optional<StoredObjectMetadata> getMetadata(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) return Optional.empty();
        StoredObjectMetadata meta = metadataRegistry.get(objectKey);
        if (meta != null) return Optional.of(meta);

        // Fallback: check file presence directly
        try {
            Path path = resolveSafePath(objectKey);
            if (Files.exists(path)) {
                long size = Files.size(path);
                String mime = getMimeForExtension(objectKey);
                StoredObjectMetadata fallbackMeta = new StoredObjectMetadata(
                        objectKey, mime, size, Instant.now().toString(), true
                );
                metadataRegistry.put(objectKey, fallbackMeta);
                return Optional.of(fallbackMeta);
            }
        } catch (Exception ignored) {}
        return Optional.empty();
    }

    @Override
    public Optional<String> generateAccessUrl(String objectKey, Duration duration) {
        if (objectKey == null || objectKey.isBlank()) return Optional.empty();
        try {
            Path path = resolveSafePath(objectKey);
            if (Files.exists(path)) {
                return Optional.of("/api/storage/local?key=" + objectKey);
            }
        } catch (Exception ignored) {}
        return Optional.empty();
    }

    @Override
    public boolean deleteObject(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) return false;
        metadataRegistry.remove(objectKey);
        try {
            Path path = resolveSafePath(objectKey);
            return Files.deleteIfExists(path);
        } catch (Exception e) {
            log.warn("Failed to delete local object {}: {}", objectKey, e.getMessage());
            return false;
        }
    }

    public Path resolveSafePath(String objectKey) {
        if (objectKey == null || objectKey.contains("..") || objectKey.contains(":") || objectKey.startsWith("/")) {
            throw new SecurityException("Path traversal attempt detected in objectKey: " + objectKey);
        }
        Path resolved = storageRoot.resolve(objectKey).normalize();
        if (!resolved.startsWith(storageRoot)) {
            throw new SecurityException("Path traversal outside storage root: " + objectKey);
        }
        return resolved;
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

    private String getMimeForExtension(String key) {
        String lower = key.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".webp")) return "image/webp";
        return "image/png";
    }

    public static void validateImageSignature(byte[] bytes, String normalizedMime) {
        if (bytes == null || bytes.length < 12) {
            throw new IllegalArgumentException("Payload too small to constitute a valid image file");
        }
        boolean valid = switch (normalizedMime) {
            case "image/png" -> (bytes[0] == (byte) 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47 &&
                                 bytes[4] == 0x0D && bytes[5] == 0x0A && bytes[6] == 0x1A && bytes[7] == 0x0A);
            case "image/jpeg", "image/jpg" -> (bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8 && bytes[2] == (byte) 0xFF);
            case "image/webp" -> (bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F' &&
                                  bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P');
            default -> false;
        };
        if (!valid) {
            throw new IllegalArgumentException("File content signature does not match declared MIME type: " + normalizedMime);
        }
    }
}
