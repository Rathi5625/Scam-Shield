package com.scamshield.controller;

import com.scamshield.dto.ScanHistoryDtos.SaveScanRequest;
import com.scamshield.dto.ScanHistoryDtos.ScanHistoryItemResponse;
import com.scamshield.dto.ScanHistoryDtos.ScanHistoryListResponse;
import com.scamshield.service.ScanHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/history")
public class ScanHistoryController {

    private final ScanHistoryService scanHistoryService;

    public ScanHistoryController(ScanHistoryService scanHistoryService) {
        this.scanHistoryService = scanHistoryService;
    }

    /**
     * Saves a scan record. The user identity is strictly bound to the authenticated JWT subject.
     */
    @PostMapping
    public ResponseEntity<ScanHistoryItemResponse> saveScan(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody SaveScanRequest request) {
        String authUserId = jwt.getSubject();
        request.setUserId(authUserId);
        ScanHistoryItemResponse response = scanHistoryService.saveScan(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Lists scans for the authenticated operative.
     * The backend derives the identity strictly from the verified JWT, ignoring client-supplied userId.
     */
    @GetMapping
    public ResponseEntity<ScanHistoryListResponse> listScans(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false, defaultValue = "50") int limit) {
        String authUserId = jwt.getSubject();
        ScanHistoryListResponse response = scanHistoryService.listScans(authUserId, limit);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves an individual scan by ID. Scoped strictly to the authenticated operative.
     */
    @GetMapping("/{scanId}")
    public ResponseEntity<?> getScan(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String scanId) {
        String authUserId = jwt.getSubject();
        return scanHistoryService.getScan(authUserId, scanId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Deletes a scan record belonging to the authenticated operative.
     */
    @DeleteMapping("/{scanId}")
    public ResponseEntity<Map<String, Object>> deleteScan(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String scanId) {
        String authUserId = jwt.getSubject();
        scanHistoryService.deleteScan(authUserId, scanId);
        return ResponseEntity.ok(Map.of("deleted", true, "scanId", scanId));
    }

    /**
     * Clears all scan history for the authenticated operative.
     */
    @DeleteMapping
    public ResponseEntity<Map<String, Object>> clearUserHistory(@AuthenticationPrincipal Jwt jwt) {
        String authUserId = jwt.getSubject();
        int count = scanHistoryService.clearUserHistory(authUserId);
        return ResponseEntity.ok(Map.of("clearedCount", count, "userId", authUserId));
    }
}
