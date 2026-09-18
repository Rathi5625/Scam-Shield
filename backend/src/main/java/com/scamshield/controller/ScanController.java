package com.scamshield.controller;

import com.scamshield.dto.ImageScanRequest;
import com.scamshield.dto.ScanResponse;
import com.scamshield.dto.TextScanRequest;
import com.scamshield.dto.UrlScanRequest;
import com.scamshield.dto.UrlScanResponse;
import com.scamshield.service.ScanService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/scan")
public class ScanController {

    private final ScanService scanService;

    public ScanController(ScanService scanService) {
        this.scanService = scanService;
    }

    @PostMapping("/text")
    public ResponseEntity<ScanResponse> scanText(@Valid @RequestBody TextScanRequest request) {
        ScanResponse response = scanService.scanText(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/image")
    public ResponseEntity<ScanResponse> scanImage(@Valid @RequestBody ImageScanRequest request) {
        ScanResponse response = scanService.scanImage(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/url")
    public ResponseEntity<UrlScanResponse> scanUrl(@Valid @RequestBody UrlScanRequest request) {
        UrlScanResponse response = scanService.scanUrl(request);
        return ResponseEntity.ok(response);
    }
}
