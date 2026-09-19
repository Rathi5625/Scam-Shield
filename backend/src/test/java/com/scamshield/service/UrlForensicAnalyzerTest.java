package com.scamshield.service;

import com.scamshield.dto.UrlScanResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UrlForensicAnalyzerTest {

    @Test
    @DisplayName("Clean reputable domain https://example.com evaluates as SAFE with low riskScore")
    void cleanDomainEvaluatesAsSafe() {
        UrlScanResponse response = UrlForensicAnalyzer.analyze("https://example.com");

        assertThat(response).isNotNull();
        assertThat(response.verdict()).isEqualTo("SAFE");
        assertThat(response.riskScore()).isLessThan(30);
        assertThat(response.reasons()).anyMatch(r -> r.contains("No obvious deceptive lexical indicators detected"));
        assertThat(response.reasons()).anyMatch(r -> r.contains("Valid HTTPS protocol"));
    }

    @Test
    @DisplayName("Subdomain lookalike https://secure-account-verify.example.com/login triggers high-risk indicators")
    void subdomainSpoofingEvaluatesAsSuspicious() {
        UrlScanResponse response = UrlForensicAnalyzer.analyze("https://secure-account-verify.example.com/login");

        assertThat(response).isNotNull();
        assertThat(response.verdict()).isEqualTo("SUSPICIOUS");
        assertThat(response.riskScore()).isGreaterThanOrEqualTo(50);
        assertThat(response.reasons()).anyMatch(r -> r.contains("Deceptive security/financial keywords"));
        assertThat(response.reasons()).anyMatch(r -> r.contains("Sensitive authentication/verification path segment"));
    }

    @Test
    @DisplayName("URL with redirection params https://example.com/login?verify=true&redirect=account produces distinct query signals")
    void redirectionParametersEvaluatesAsSuspicious() {
        UrlScanResponse response = UrlForensicAnalyzer.analyze("https://example.com/login?verify=true&redirect=account");

        assertThat(response).isNotNull();
        assertThat(response.verdict()).isEqualTo("SUSPICIOUS");
        assertThat(response.reasons()).anyMatch(r -> r.contains("Sensitive authentication/verification path segment"));
        assertThat(response.reasons()).anyMatch(r -> r.contains("Potentially hazardous redirection or state parameter"));
    }

    @Test
    @DisplayName("Unencrypted plain HTTP triggers insecure transmission warning")
    void insecureHttpTransmissionDetected() {
        UrlScanResponse response = UrlForensicAnalyzer.analyze("http://my-personal-blog.org/article");

        assertThat(response).isNotNull();
        assertThat(response.reasons()).anyMatch(r -> r.contains("Insecure transmission"));
    }

    @Test
    @DisplayName("Raw numeric IP address destination is flagged")
    void rawIpAddressDetected() {
        UrlScanResponse response = UrlForensicAnalyzer.analyze("http://192.168.1.100/admin");

        assertThat(response).isNotNull();
        assertThat(response.verdict()).isEqualTo("SUSPICIOUS");
        assertThat(response.reasons()).anyMatch(r -> r.contains("Raw numeric IP address"));
    }

    @Test
    @DisplayName("Known shortener service is identified")
    void urlShortenerDetected() {
        UrlScanResponse response = UrlForensicAnalyzer.analyze("https://bit.ly/urgent-banking-alert");

        assertThat(response).isNotNull();
        assertThat(response.verdict()).isEqualTo("SUSPICIOUS");
        assertThat(response.reasons()).anyMatch(r -> r.contains("Known URL shortening service"));
    }

    @Test
    @DisplayName("Punycode homograph domain is isolated")
    void punycodeHomographDetected() {
        UrlScanResponse response = UrlForensicAnalyzer.analyze("https://xn--pple-43d.com/login");

        assertThat(response).isNotNull();
        assertThat(response.verdict()).isEqualTo("SUSPICIOUS");
        assertThat(response.reasons()).anyMatch(r -> r.contains("Punycode"));
    }

    @Test
    @DisplayName("High-risk top level domain (.xyz) is flagged")
    void highRiskTldDetected() {
        UrlScanResponse response = UrlForensicAnalyzer.analyze("https://gift-prizes.xyz/claim");

        assertThat(response).isNotNull();
        assertThat(response.verdict()).isEqualTo("SUSPICIOUS");
        assertThat(response.reasons()).anyMatch(r -> r.contains("High-risk top-level domain"));
    }

    @Test
    @DisplayName("Empty or blank URL is handled safely")
    void emptyUrlHandledSafely() {
        UrlScanResponse response = UrlForensicAnalyzer.analyze("");

        assertThat(response).isNotNull();
        assertThat(response.verdict()).isEqualTo("SUSPICIOUS");
        assertThat(response.reasons()).anyMatch(r -> r.contains("Missing input"));
    }
}
