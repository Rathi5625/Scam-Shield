package com.scamshield.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.scamshield.dto.ImageScanRequest;
import com.scamshield.dto.TextScanRequest;
import com.scamshield.dto.UrlScanRequest;
import com.scamshield.model.RiskLevel;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ScanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void healthCheckReturnsOk() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.mode").value("MOCK"));
    }

    @Test
    void scanTextHighRiskKycReturnsProperSchema() throws Exception {
        TextScanRequest request = new TextScanRequest("URGENT: Your SBI bank account will be blocked within 2 hours. Update KYC now by clicking http://bit.ly/sbi-kyc-verify");

        mockMvc.perform(post("/api/scan/text")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scanId", notNullValue()))
                .andExpect(jsonPath("$.riskLevel").value("HIGH"))
                .andExpect(jsonPath("$.riskScore", greaterThanOrEqualTo(75)))
                .andExpect(jsonPath("$.category").value("BANKING_KYC"))
                .andExpect(jsonPath("$.redFlags", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$.redFlags[0].type").isNotEmpty())
                .andExpect(jsonPath("$.redFlags[0].label").isNotEmpty())
                .andExpect(jsonPath("$.redFlags[0].score", greaterThan(0)))
                .andExpect(jsonPath("$.action").isNotEmpty())
                .andExpect(jsonPath("$.createdAt").isNotEmpty());
    }

    @Test
    void scanTextMediumRiskJobReturnsProperSchema() throws Exception {
        TextScanRequest request = new TextScanRequest("Congratulations! You have been selected for Part Time Amazon Work From Home job. Earn Rs 5000 daily. Contact on Telegram.");

        mockMvc.perform(post("/api/scan/text")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.riskLevel").value("MEDIUM"))
                .andExpect(jsonPath("$.riskScore", allOf(greaterThanOrEqualTo(35), lessThan(75))))
                .andExpect(jsonPath("$.category").value("JOB_SCAM"))
                .andExpect(jsonPath("$.action").isNotEmpty());
    }

    @Test
    void scanTextLowRiskReturnsProperSchema() throws Exception {
        TextScanRequest request = new TextScanRequest("Hey, let us have lunch meeting tomorrow at 1pm near the office.");

        mockMvc.perform(post("/api/scan/text")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.riskLevel").value("LOW"))
                .andExpect(jsonPath("$.riskScore", lessThan(35)))
                .andExpect(jsonPath("$.action").isNotEmpty());
    }

    @Test
    void scanTextUnknownFallbackReturnsProperSchema() throws Exception {
        TextScanRequest request = new TextScanRequest("short");

        mockMvc.perform(post("/api/scan/text")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.riskLevel").value("UNKNOWN"))
                .andExpect(jsonPath("$.action").isNotEmpty());
    }

    @Test
    void scanUrlReturnsHeuristics() throws Exception {
        UrlScanRequest request = new UrlScanRequest("http://bit.ly/sbi-kyc-update-alert");

        mockMvc.perform(post("/api/scan/url")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scanId", notNullValue()))
                .andExpect(jsonPath("$.verdict").value("SUSPICIOUS"))
                .andExpect(jsonPath("$.reasons", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    void scanImageReturnsHighRiskSchema() throws Exception {
        ImageScanRequest request = new ImageScanRequest("screenshots/user123/sample-kyc.png");

        mockMvc.perform(post("/api/scan/image")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scanId", notNullValue()))
                .andExpect(jsonPath("$.riskLevel").value("HIGH"))
                .andExpect(jsonPath("$.category").value("BANKING_KYC"))
                .andExpect(jsonPath("$.redFlags", hasSize(greaterThan(0))));
    }

    @Test
    void blankTextReturnsValidationError() throws Exception {
        TextScanRequest request = new TextScanRequest("");

        mockMvc.perform(post("/api/scan/text")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }
}
