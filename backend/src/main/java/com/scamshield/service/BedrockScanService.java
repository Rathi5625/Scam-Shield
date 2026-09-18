package com.scamshield.service;

import com.scamshield.dto.ImageScanRequest;
import com.scamshield.dto.ScanResponse;
import com.scamshield.dto.TextScanRequest;
import com.scamshield.dto.UrlScanRequest;
import com.scamshield.dto.UrlScanResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * Architectural seam for future Amazon Bedrock integration.
 * Active only when scan.mode=LIVE.
 * In Phase 1 and 2 local development, SCAN_MODE=MOCK is used, keeping this disabled.
 * Does NOT contain credentials, secrets, or external AWS calls.
 */
@Service
@ConditionalOnProperty(name = "scan.mode", havingValue = "LIVE")
public class BedrockScanService implements ScanService {

    private static final Logger log = LoggerFactory.getLogger(BedrockScanService.class);

    @Override
    public ScanResponse scanText(TextScanRequest request) {
        log.info("BedrockScanService: Live Bedrock integration seam invoked.");
        throw new UnsupportedOperationException(
                "Live Amazon Bedrock scanning is disabled in local mode. Please use SCAN_MODE=MOCK."
        );
    }

    @Override
    public ScanResponse scanImage(ImageScanRequest request) {
        log.info("BedrockScanService: Live multimodal screenshot seam invoked.");
        throw new UnsupportedOperationException(
                "Live Amazon Bedrock multimodal scanning is disabled in local mode. Please use SCAN_MODE=MOCK."
        );
    }

    @Override
    public UrlScanResponse scanUrl(UrlScanRequest request) {
        log.info("BedrockScanService: URL heuristic seam invoked.");
        throw new UnsupportedOperationException(
                "Live URL scanning is disabled in local mode. Please use SCAN_MODE=MOCK."
        );
    }
}
