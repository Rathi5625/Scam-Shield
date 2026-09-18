package com.scamshield.controller;

import com.scamshield.dto.ImageScanRequest;
import com.scamshield.dto.ScanHistoryDtos.SaveScanRequest;
import com.scamshield.dto.ScanResponse;
import com.scamshield.dto.TextScanRequest;
import com.scamshield.dto.UrlScanRequest;
import com.scamshield.dto.UrlScanResponse;
import com.scamshield.model.RiskLevel;
import com.scamshield.service.FamilyProtectionService;
import com.scamshield.service.ScanHistoryService;
import com.scamshield.service.ScanService;
import com.scamshield.service.notification.NotificationService;
import com.scamshield.service.storage.ObjectStorageService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.UUID;

@RestController
@RequestMapping("/api/scan")
public class ScanController {

    private static final Logger log = LoggerFactory.getLogger(ScanController.class);

    private final ScanService scanService;
    private final ScanHistoryService scanHistoryService;
    private final ObjectStorageService objectStorageService;
    private final NotificationService notificationService;
    private final FamilyProtectionService familyProtectionService;

    @Autowired
    public ScanController(
            ScanService scanService,
            ScanHistoryService scanHistoryService,
            @Autowired(required = false) ObjectStorageService objectStorageService,
            @Autowired(required = false) NotificationService notificationService,
            @Autowired(required = false) FamilyProtectionService familyProtectionService) {
        this.scanService = scanService;
        this.scanHistoryService = scanHistoryService;
        this.objectStorageService = objectStorageService;
        this.notificationService = notificationService;
        this.familyProtectionService = familyProtectionService;
    }

    public ScanController(ScanService scanService, ScanHistoryService scanHistoryService) {
        this(scanService, scanHistoryService, null, null, null);
    }

    @PostMapping("/text")
    public ResponseEntity<ScanResponse> scanText(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody TextScanRequest request) {
        ScanResponse response = scanService.scanText(request);

        // If the request was authenticated with a Cognito JWT, auto-persist to history repository
        if (jwt != null && jwt.getSubject() != null && scanHistoryService != null) {
            try {
                String notifStatus = processFamilyNotification(jwt.getSubject(), response);

                SaveScanRequest saveReq = new SaveScanRequest();
                saveReq.setUserId(jwt.getSubject());
                saveReq.setScanType("TEXT");
                saveReq.setInputSummary(request.text());
                saveReq.setRiskLevel(response.riskLevel().name());
                saveReq.setRiskScore(response.riskScore());
                saveReq.setCategory(response.category().name());
                saveReq.setAction(response.action());
                saveReq.setNotificationStatus(notifStatus);
                if (response.redFlags() != null) {
                    saveReq.setRedFlags(new ArrayList<>(response.redFlags()));
                }
                scanHistoryService.saveScan(saveReq);
                log.debug("Auto-persisted scan to history for authenticated user: {}", jwt.getSubject());
            } catch (Exception e) {
                log.warn("Non-blocking: Auto-persisting scan to history failed: {}", e.getMessage());
            }
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/image")
    public ResponseEntity<ScanResponse> scanImage(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ImageScanRequest request) {

        String userId = (jwt != null && jwt.getSubject() != null) ? jwt.getSubject() : "anonymous";
        String storageKey = request != null ? request.s3Key() : null;

        // If base64 image bytes are present and storage service is configured, store securely
        if (request != null && request.imageBase64() != null && !request.imageBase64().isBlank() && objectStorageService != null) {
            try {
                byte[] imageBytes = Base64.getDecoder().decode(request.imageBase64().trim());
                String mimeType = request.mimeType() != null ? request.mimeType() : "image/png";
                var stored = objectStorageService.storeObject(userId, imageBytes, mimeType, true);
                storageKey = stored.objectKey();
                log.info("Securely stored screenshot for user {}: key={}", userId, storageKey);
            } catch (Exception e) {
                log.warn("Object storage failed: {}", e.getMessage());
            }
        }

        ScanResponse response = scanService.scanImage(request);

        if (jwt != null && jwt.getSubject() != null && scanHistoryService != null) {
            try {
                String notifStatus = processFamilyNotification(jwt.getSubject(), response);

                SaveScanRequest saveReq = new SaveScanRequest();
                saveReq.setUserId(jwt.getSubject());
                saveReq.setScanType("IMAGE");
                saveReq.setInputSummary("[Uploaded Screenshot]");
                saveReq.setRiskLevel(response.riskLevel().name());
                saveReq.setRiskScore(response.riskScore());
                saveReq.setCategory(response.category().name());
                saveReq.setAction(response.action());
                saveReq.setS3Key(storageKey);
                saveReq.setStorageObjectKey(storageKey);
                saveReq.setNotificationStatus(notifStatus);
                if (response.redFlags() != null) {
                    saveReq.setRedFlags(new ArrayList<>(response.redFlags()));
                }
                scanHistoryService.saveScan(saveReq);
                log.debug("Auto-persisted image scan to history for authenticated user: {}", jwt.getSubject());
            } catch (Exception e) {
                log.warn("Non-blocking: Auto-persisting image scan failed: {}", e.getMessage());
            }
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/url")
    public ResponseEntity<UrlScanResponse> scanUrl(@Valid @RequestBody UrlScanRequest request) {
        UrlScanResponse response = scanService.scanUrl(request);
        return ResponseEntity.ok(response);
    }

    private String processFamilyNotification(String userId, ScanResponse response) {
        if (notificationService == null || familyProtectionService == null || userId == null || response == null) {
            return "NONE";
        }

        // Only notify on HIGH risk by default
        if (response.riskLevel() != RiskLevel.HIGH) {
            return "SUPPRESSED";
        }

        try {
            var groupOpt = familyProtectionService.getGroupByUserId(userId);
            if (groupOpt.isEmpty()) {
                return "NONE";
            }

            var group = groupOpt.get();
            var settings = group.getProtectionSettings();
            boolean alertsEnabled = settings == null || !Boolean.FALSE.equals(settings.get("familyAlerts"));
            if (!alertsEnabled) {
                log.debug("Family alerts disabled in settings for group {}", group.getGroupId());
                return "SUPPRESSED";
            }

            var event = new NotificationService.ThreatAlertEvent(
                    UUID.randomUUID().toString(),
                    response.scanId(),
                    group.getGroupId(),
                    userId,
                    response.riskLevel().name(),
                    response.riskScore(),
                    response.category() != null ? response.category().name() : "PHISHING",
                    response.engineName(),
                    Instant.now().toString()
            );

            var result = notificationService.sendThreatAlert(event);
            return result.delivered() ? "DELIVERED" : "FAILED";

        } catch (Exception e) {
            log.warn("Non-blocking family notification dispatch failed: {}", e.getMessage());
            return "FAILED";
        }
    }
}
