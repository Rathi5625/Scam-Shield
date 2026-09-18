package com.scamshield.controller;

import com.scamshield.dto.FamilyDtos.FamilyGroupResponse;
import com.scamshield.service.FamilyProtectionService;
import com.scamshield.service.storage.LocalObjectStorageService;
import com.scamshield.service.storage.ObjectStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Secure screenshot and artifact storage controller.
 * Enforces strict IDOR prevention: only the verified creator or authorized family circle member
 * can access stored screenshot evidence.
 */
@RestController
@RequestMapping("/api/storage")
public class StorageController {

    private static final Logger log = LoggerFactory.getLogger(StorageController.class);

    private static final Pattern SAFE_KEY_PATTERN = Pattern.compile("^private/[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+\\.(png|jpg|jpeg|webp)$");

    private final ObjectStorageService objectStorageService;
    private final FamilyProtectionService familyProtectionService;

    @Autowired
    public StorageController(
            @Autowired(required = false) ObjectStorageService objectStorageService,
            @Autowired(required = false) FamilyProtectionService familyProtectionService) {
        this.objectStorageService = objectStorageService;
        this.familyProtectionService = familyProtectionService;
    }

    /**
     * Retrieves stored screenshot artifact with strict ownership validation.
     * Prevents IDOR and path traversal.
     */
    @GetMapping({"/local", "/preview"})
    public ResponseEntity<?> getStoredObject(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam("key") String objectKey) {

        if (jwt == null || jwt.getSubject() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "UNAUTHORIZED", "message", "Authentication required to access stored artifacts."));
        }

        String callerUserId = jwt.getSubject();

        // 1. Path traversal & malformed key check
        if (objectKey == null || objectKey.isBlank() || !SAFE_KEY_PATTERN.matcher(objectKey).matches()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "BAD_REQUEST", "message", "Invalid or malformed object key format."));
        }

        // 2. Extract partition owner from key: private/<ownerId>/<filename>
        String[] parts = objectKey.split("/");
        String keyOwnerId = parts[1];

        // 3. IDOR Authorization Check: Caller must be the key owner OR belong to the same family ward
        boolean isOwner = callerUserId.equals(keyOwnerId);
        boolean isAuthorizedFamily = false;

        if (!isOwner && familyProtectionService != null) {
            try {
                Optional<FamilyGroupResponse> callerGroup = familyProtectionService.getGroupByUserId(callerUserId);
                if (callerGroup.isPresent()) {
                    // Check if owner is a member of caller's group
                    isAuthorizedFamily = callerGroup.get().getMembers() != null &&
                            callerGroup.get().getMembers().stream().anyMatch(m -> keyOwnerId.equals(m.getUserId()));
                }
            } catch (Exception e) {
                log.warn("Family membership check failed during storage authorization: {}", e.getMessage());
            }
        }

        if (!isOwner && !isAuthorizedFamily) {
            log.warn("IDOR violation blocked: Caller {} attempted to access artifact owned by {}", callerUserId, keyOwnerId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "FORBIDDEN", "message", "Access denied: You do not have permission to view this artifact."));
        }

        // 4. Retrieve and serve object
        if (objectStorageService == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "SERVICE_UNAVAILABLE", "message", "Storage service is unavailable."));
        }

        var metadataOpt = objectStorageService.getMetadata(objectKey);
        if (metadataOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        var meta = metadataOpt.get();

        // If local storage, fetch local file bytes
        if (objectStorageService instanceof LocalObjectStorageService localService) {
            try {
                Path filePath = localService.resolveSafePath(objectKey);
                if (!Files.exists(filePath)) {
                    return ResponseEntity.notFound().build();
                }
                byte[] bytes = Files.readAllBytes(filePath);
                MediaType mediaType = switch (meta.mimeType()) {
                    case "image/jpeg", "image/jpg" -> MediaType.IMAGE_JPEG;
                    case "image/webp" -> MediaType.valueOf("image/webp");
                    default -> MediaType.IMAGE_PNG;
                };

                return ResponseEntity.ok()
                        .contentType(mediaType)
                        .header(HttpHeaders.CACHE_CONTROL, "private, no-cache, no-store, must-revalidate")
                        .header("X-Content-Type-Options", "nosniff")
                        .body(bytes);

            } catch (Exception e) {
                log.error("Failed to read local object {}: {}", objectKey, e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "INTERNAL_SERVER_ERROR", "message", "Could not read object."));
            }
        } else {
            // S3 storage: generate short-lived pre-signed URL and redirect
            Optional<String> accessUrl = objectStorageService.generateAccessUrl(objectKey, Duration.ofMinutes(5));
            if (accessUrl.isPresent()) {
                return ResponseEntity.status(HttpStatus.FOUND)
                        .location(URI.create(accessUrl.get()))
                        .build();
            }
            return ResponseEntity.notFound().build();
        }
    }
}
