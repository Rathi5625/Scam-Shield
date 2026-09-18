package com.scamshield.service;

import com.scamshield.dto.ImageScanRequest;
import com.scamshield.dto.ScanResponse;
import com.scamshield.dto.TextScanRequest;
import com.scamshield.dto.UrlScanRequest;
import com.scamshield.dto.UrlScanResponse;

public interface ScanService {
    ScanResponse scanText(TextScanRequest request);
    ScanResponse scanImage(ImageScanRequest request);
    UrlScanResponse scanUrl(UrlScanRequest request);
}
