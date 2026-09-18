package com.scamshield.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scamshield.dto.ScanHistoryDtos.SaveScanRequest;
import com.scamshield.dto.ScanHistoryDtos.ScanHistoryItemResponse;
import com.scamshield.dto.ScanHistoryDtos.ScanHistoryListResponse;
import com.scamshield.model.ScanHistoryEntity;
import com.scamshield.repository.ScanHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ScanHistoryService {

    private static final Logger log = LoggerFactory.getLogger(ScanHistoryService.class);

    // Privacy Redaction regex patterns
    private static final Pattern CARD_PATTERN = Pattern.compile("\\b(?:\\d[ -]*?){13,16}\\b");
    private static final Pattern OTP_PATTERN = Pattern.compile("(?i)\\b(?:otp|one[- ]?time[- ]?password|code|verification[- ]?code)(?:\\s+(?:is|was|number|code))?\\s*[:=]?\\s*\\d{4,8}\\b");
    private static final Pattern PIN_PATTERN = Pattern.compile("(?i)\\b(?:pin|mpin|passcode)(?:\\s+(?:is|was|number|code))?\\s*[:=]?\\s*\\d{4,6}\\b");
    private static final Pattern CVV_PATTERN = Pattern.compile("(?i)\\b(?:cvv|cvc|security[- ]?code)(?:\\s+(?:is|was|number|code))?\\s*[:=]?\\s*\\d{3,4}\\b");
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("(?i)\\b(?:password|passwd|pwd)\\s*[:=]\\s*[^\\s,;]{3,32}\\b");
    private static final Pattern URL_AUTH_PARAM_PATTERN = Pattern.compile("(?i)([?&](token|auth|key|code|session|secret)=)[^&]+");

    private final ScanHistoryRepository scanHistoryRepository;
    private final ObjectMapper objectMapper;

    public ScanHistoryService(ScanHistoryRepository scanHistoryRepository, ObjectMapper objectMapper) {
        this.scanHistoryRepository = scanHistoryRepository;
        this.objectMapper = objectMapper;
    }

    public ScanHistoryItemResponse saveScan(SaveScanRequest req) {
        if (req.getUserId() == null || req.getUserId().trim().isEmpty()) {
            throw new IllegalArgumentException("userId is required to record a scan");
        }

        ScanHistoryEntity entity = new ScanHistoryEntity();
        entity.setUserId(req.getUserId());
        entity.setScanId(UUID.randomUUID().toString());
        entity.setScanType(req.getScanType() != null ? req.getScanType() : "TEXT");

        // Apply strict PII redaction and 140-character summary truncation
        String sanitized = sanitizeInputSummary(req.getInputSummary());
        entity.setInputSummary(sanitized);

        entity.setRiskLevel(req.getRiskLevel() != null ? req.getRiskLevel() : "LOW");
        entity.setRiskScore(req.getRiskScore() != null ? req.getRiskScore() : 0);
        entity.setCategory(req.getCategory() != null ? req.getCategory() : "General Analysis");
        entity.setAction(req.getAction() != null ? req.getAction() : "No immediate action required.");
        entity.setGroupId(req.getGroupId());
        entity.setSharedBy(req.getSharedBy());
        entity.setS3Key(req.getS3Key());
        entity.setStorageObjectKey(req.getStorageObjectKey() != null ? req.getStorageObjectKey() : req.getS3Key());
        entity.setNotificationStatus(req.getNotificationStatus() != null ? req.getNotificationStatus() : "NONE");
        entity.setCreatedAt(Instant.now().toString());

        if (req.getRedFlags() != null) {
            try {
                entity.setRedFlagsJson(objectMapper.writeValueAsString(req.getRedFlags()));
            } catch (Exception e) {
                log.warn("Failed to serialize redFlags: {}", e.getMessage());
            }
        }

        ScanHistoryEntity saved = scanHistoryRepository.save(entity);
        log.info("Saved scan {} for user {}", saved.getScanId(), saved.getUserId());
        return toResponse(saved);
    }

    public Optional<ScanHistoryItemResponse> getScan(String userId, String scanId) {
        if (userId == null || scanId == null) return Optional.empty();
        return scanHistoryRepository.findByUserIdAndScanId(userId, scanId)
                .map(this::toResponse);
    }

    public ScanHistoryListResponse listScans(String userId, int limit) {
        if (userId == null || userId.trim().isEmpty()) {
            return new ScanHistoryListResponse(List.of(), 0, null);
        }
        int effectiveLimit = limit > 0 ? limit : 50;
        List<ScanHistoryEntity> entities = scanHistoryRepository.findByUserId(userId, effectiveLimit);
        List<ScanHistoryItemResponse> dtos = entities.stream().map(this::toResponse).collect(Collectors.toList());
        return new ScanHistoryListResponse(dtos, dtos.size(), null);
    }

    public void deleteScan(String userId, String scanId) {
        scanHistoryRepository.deleteByUserIdAndScanId(userId, scanId);
    }

    public int clearUserHistory(String userId) {
        return scanHistoryRepository.deleteByUserId(userId);
    }

    public List<ScanHistoryItemResponse> getGroupThreatFeed(String groupId, int limit) {
        if (groupId == null || groupId.trim().isEmpty()) return List.of();
        int effectiveLimit = limit > 0 ? limit : 20;
        return scanHistoryRepository.findByGroupId(groupId, effectiveLimit)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Sanitizes input text: redacts OTPs, credit cards, URL sensitive params, and caps at 140 chars.
     */
    public String sanitizeInputSummary(String text) {
        if (text == null || text.trim().isEmpty()) return "Autonomous heuristic telemetry";
        String s = text.trim();

        // Redact OTPs and PINs
        s = OTP_PATTERN.matcher(s).replaceAll("OTP: [REDACTED]");
        s = PIN_PATTERN.matcher(s).replaceAll("PIN: [REDACTED]");
        s = CVV_PATTERN.matcher(s).replaceAll("CVV: [REDACTED]");
        s = PASSWORD_PATTERN.matcher(s).replaceAll("password: [REDACTED]");
        // Redact credit cards
        s = CARD_PATTERN.matcher(s).replaceAll("•••• •••• •••• [REDACTED]");
        // Strip URL auth parameters
        s = URL_AUTH_PARAM_PATTERN.matcher(s).replaceAll("$1[REDACTED]");

        // Cap at 140 characters
        if (s.length() > 140) {
            s = s.substring(0, 137) + "...";
        }
        return s;
    }

    private ScanHistoryItemResponse toResponse(ScanHistoryEntity entity) {
        ScanHistoryItemResponse res = new ScanHistoryItemResponse();
        res.setScanId(entity.getScanId());
        res.setUserId(entity.getUserId());
        res.setScanType(entity.getScanType());
        res.setInputSummary(entity.getInputSummary());
        res.setRiskLevel(entity.getRiskLevel());
        res.setRiskScore(entity.getRiskScore());
        res.setCategory(entity.getCategory());
        res.setAction(entity.getAction());
        res.setGroupId(entity.getGroupId());
        res.setSharedBy(entity.getSharedBy());
        res.setS3Key(entity.getS3Key());
        res.setStorageObjectKey(entity.getStorageObjectKey());
        res.setNotificationStatus(entity.getNotificationStatus());
        res.setCreatedAt(entity.getCreatedAt());

        if (entity.getRedFlagsJson() != null && !entity.getRedFlagsJson().trim().isEmpty()) {
            try {
                List<Object> flags = objectMapper.readValue(
                        entity.getRedFlagsJson(),
                        new TypeReference<List<Object>>() {}
                );
                res.setRedFlags(flags);
            } catch (Exception e) {
                res.setRedFlags(new ArrayList<>());
            }
        } else {
            res.setRedFlags(new ArrayList<>());
        }
        return res;
    }
}
