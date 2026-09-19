package com.scamshield.service;

import com.scamshield.dto.UrlScanResponse;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Deterministic, network-isolated lexical forensics analyzer for URLs.
 * Evaluates URL string characteristics without performing DNS lookup, HTTP crawling,
 * redirects, or any external network dispatch (100% SSRF-safe).
 */
public final class UrlForensicAnalyzer {

    private static final Pattern IP_PATTERN = Pattern.compile("^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$");
    private static final Pattern ENCODED_PATTERN = Pattern.compile("%[0-9a-fA-F]{2}");

    private static final List<String> KNOWN_SHORTENERS = List.of(
            "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "cutt.ly", "rb.gy", "tiny.cc"
    );

    private static final Set<String> HIGH_RISK_TLDS = Set.of(
            "tk", "xyz", "top", "buzz", "work", "click", "link", "club", "surf", "gq", "ml", "cf", "cc", "rest", "fit"
    );

    private static final List<String> DECEPTIVE_KEYWORDS = List.of(
            "secure", "verify", "verification", "account", "login", "signin", "auth", "support",
            "bank", "banking", "kyc", "update", "alert", "claim", "reward", "gift", "wallet",
            "paytm", "gpay", "phonepe", "sbi", "hdfc", "icici", "aadhaar", "pan", "security"
    );

    private static final List<String> SUSPICIOUS_PATHS = List.of(
            "/login", "/signin", "/verify", "/verification", "/account", "/update", "/kyc",
            "/credential", "/password", "/reset", "/claim", "/auth", "/session"
    );

    private static final Set<String> SUSPICIOUS_QUERY_KEYS = Set.of(
            "redirect", "redirect_uri", "redirect_url", "url", "dest", "destination",
            "return", "return_url", "returnurl", "continue", "next", "token", "auth",
            "session", "verify", "account", "login", "key", "target"
    );

    private UrlForensicAnalyzer() {}

    public static UrlScanResponse analyze(String rawUrl) {
        String input = rawUrl != null ? rawUrl.trim() : "";
        String scanId = "URL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        String timestamp = Instant.now().toString();

        if (input.isEmpty()) {
            return new UrlScanResponse(
                    scanId,
                    "SUSPICIOUS",
                    List.of("Missing input: No URL provided for lexical analysis"),
                    timestamp,
                    80,
                    input
            );
        }

        List<String> reasons = new ArrayList<>();
        int score = 10; // Baseline benign score

        String scheme = "";
        String host = "";
        int port = -1;
        String path = "";
        String rawQuery = "";

        try {
            // Prepend https:// if no scheme is present for parsing
            String urlToParse = (input.startsWith("http://") || input.startsWith("https://"))
                    ? input
                    : "https://" + input;

            URI uri = URI.create(urlToParse);
            scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase(Locale.ROOT) : "";
            host = uri.getHost() != null ? uri.getHost().toLowerCase(Locale.ROOT) : "";
            port = uri.getPort();
            path = uri.getRawPath() != null ? uri.getRawPath().toLowerCase(Locale.ROOT) : "";
            rawQuery = uri.getRawQuery() != null ? uri.getRawQuery().toLowerCase(Locale.ROOT) : "";

            // Strip www. prefix for consistent inspection
            if (host.startsWith("www.")) {
                host = host.substring(4);
            }
        } catch (Exception e) {
            return new UrlScanResponse(
                    scanId,
                    "SUSPICIOUS",
                    List.of("Malformed URL syntax: Failed RFC compliant URI parsing", "Potential malformed evasion sequence"),
                    timestamp,
                    85,
                    input
            );
        }

        // 1. Protocol / Scheme analysis
        boolean explicitHttp = input.startsWith("http://");
        if (explicitHttp || "http".equals(scheme)) {
            reasons.add("Insecure transmission: No HTTPS encryption detected (plain HTTP)");
            score += 25;
        } else if (!"https".equals(scheme) && !scheme.isEmpty()) {
            reasons.add("Non-standard protocol scheme detected (" + scheme + ")");
            score += 40;
        }

        // 2. Hostname analysis
        if (IP_PATTERN.matcher(host).matches()) {
            reasons.add("Raw numeric IP address destination detected instead of reputable domain");
            score += 40;
        }

        if (host.startsWith("xn--") || host.contains(".xn--") || input.matches(".*[^\\x00-\\x7F].*")) {
            reasons.add("Punycode / Internationalized domain format detected (potential homograph impersonation vector)");
            score += 35;
        }

        // Shortener detection
        for (String shortener : KNOWN_SHORTENERS) {
            if (host.equals(shortener) || host.endsWith("." + shortener)) {
                reasons.add("Shortened URL: Destination hidden behind Known URL shortening service (" + shortener + ")");
                score += 30;
                break;
            }
        }

        // Host length
        if (host.length() > 32) {
            reasons.add("Unusually long hostname (" + host.length() + " chars), typical of deceptive subdomain packing");
            score += 15;
        }

        // Subdomain depth
        String[] hostParts = host.split("\\.");
        if (hostParts.length > 3) {
            int depth = hostParts.length - 2;
            reasons.add("Excessive subdomain depth (" + depth + " levels), commonly used to disguise actual root domain");
            score += 20;
        }

        // Deceptive keywords in host
        List<String> matchedHostKeywords = new ArrayList<>();
        for (String kw : DECEPTIVE_KEYWORDS) {
            if (host.contains(kw)) {
                matchedHostKeywords.add(kw);
            }
        }
        if (!matchedHostKeywords.isEmpty()) {
            reasons.add("Deceptive security/financial keywords embedded in hostname (" + String.join(", ", matchedHostKeywords) + ")");
            score += Math.min(45, 20 + (matchedHostKeywords.size() * 10));
        }

        // High-risk TLD
        if (hostParts.length >= 2) {
            String tld = hostParts[hostParts.length - 1];
            if (HIGH_RISK_TLDS.contains(tld)) {
                reasons.add("High-risk top-level domain frequently associated with disposable phishing campaigns (." + tld + ")");
                score += 25;
            }
        }

        // Non-standard port
        if (port > 0 && port != 80 && port != 443 && port != 8080) {
            reasons.add("Unconventional network port specified (:" + port + ")");
            score += 20;
        }

        // 3. Path analysis
        for (String sp : SUSPICIOUS_PATHS) {
            if (path.equals(sp) || path.startsWith(sp + "/") || path.contains(sp)) {
                reasons.add("Sensitive authentication/verification path segment detected (" + sp + ")");
                score += 20;
                break;
            }
        }

        String[] pathSegments = Arrays.stream(path.split("/"))
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);
        if (pathSegments.length > 4) {
            reasons.add("Deeply nested path structure (" + pathSegments.length + " segments)");
            score += 15;
        }

        // 4. Query parameter analysis
        if (!rawQuery.isEmpty()) {
            String[] queryPairs = rawQuery.split("&");
            List<String> matchedParams = new ArrayList<>();
            for (String pair : queryPairs) {
                String key = pair.split("=")[0].trim();
                if (SUSPICIOUS_QUERY_KEYS.contains(key)) {
                    matchedParams.add(key);
                }
            }
            if (!matchedParams.isEmpty()) {
                reasons.add("Potentially hazardous redirection or state parameter detected in query string (" + String.join(", ", matchedParams) + ")");
                score += 20;
            }
            if (queryPairs.length > 3) {
                reasons.add("Complex query parameter payload (" + queryPairs.length + " parameters) attached to destination link");
                score += 10;
            }
        }

        // 5. Percent encoding / obfuscation check
        if (ENCODED_PATTERN.matcher(path).find() || ENCODED_PATTERN.matcher(rawQuery).find()) {
            reasons.add("Percent-encoded obfuscation sequence detected in URL structure");
            score += 15;
        }

        // Final score capping
        score = Math.max(10, Math.min(98, score));

        String verdict;
        if (score >= 50) {
            verdict = "SUSPICIOUS";
        } else if (score >= 30) {
            verdict = "SUSPICIOUS";
        } else {
            verdict = "SAFE";
            if (reasons.isEmpty()) {
                reasons.add("No obvious deceptive lexical indicators detected");
                reasons.add("No suspicious structural indicators detected");
                reasons.add("Valid HTTPS protocol detected");
                reasons.add("Standard single-tier domain structure with reputable namespace");
                reasons.add("ScamShield analyzes this URL's structure without opening the destination");
            }
        }

        return new UrlScanResponse(scanId, verdict, reasons, timestamp, score, input);
    }
}
