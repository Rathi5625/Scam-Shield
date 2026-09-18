package com.scamshield.service;

import com.scamshield.dto.ImageScanRequest;
import com.scamshield.dto.RedFlag;
import com.scamshield.dto.ScanResponse;
import com.scamshield.dto.TextScanRequest;
import com.scamshield.dto.UrlScanRequest;
import com.scamshield.dto.UrlScanResponse;
import com.scamshield.model.RedFlagType;
import com.scamshield.model.RiskLevel;
import com.scamshield.model.ScamCategory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@ConditionalOnProperty(name = "scan.mode", havingValue = "MOCK", matchIfMissing = true)
public class MockScanService implements ScanService {

    private static final Logger log = LoggerFactory.getLogger(MockScanService.class);

    private static final Pattern IP_PATTERN = Pattern.compile("https?://\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}");
    private static final List<String> KNOWN_SHORTENERS = List.of(
            "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "cutt.ly"
    );
    private static final List<String> SUSPICIOUS_BRAND_KEYWORDS = List.of(
            "sbi-update", "hdfc-kyc", "icici-alert", "paytm-reward", "aadhaar-link", "pan-verification", "upi-claim"
    );

    @Override
    public ScanResponse scanText(TextScanRequest request) {
        String text = request.text();
        String lower = text != null ? text.toLowerCase(Locale.ROOT) : "";
        log.info("MockScanService: Analyzing text (length: {})", lower.length());

        String scanId = "01H" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase(Locale.ROOT);
        String timestamp = Instant.now().toString();

        // 1. UNKNOWN fallback case (per AI_SPEC.md §8: empty/gibberish/too short)
        if (lower.trim().length() < 10 || lower.contains("test-unknown")) {
            return new ScanResponse(
                    scanId,
                    RiskLevel.UNKNOWN,
                    15,
                    ScamCategory.OTHER,
                    List.of(new RedFlag(RedFlagType.UNSOLICITED_CONTACT, "Insufficient content to analyze", 15)),
                    "Message is too short or ambiguous to evaluate reliably. Do not share any sensitive personal information.",
                    timestamp
            );
        }

        // 2. LOW risk case
        if (lower.contains("meeting tomorrow") || lower.contains("lunch") || lower.contains("thanks")
                || lower.contains("hello how are you") || lower.contains("grocery list") || lower.contains("test-low")) {
            return new ScanResponse(
                    scanId,
                    RiskLevel.LOW,
                    12,
                    ScamCategory.OTHER,
                    List.of(
                            new RedFlag(RedFlagType.UNSOLICITED_CONTACT, "Informal or conversational text", 10),
                            new RedFlag(RedFlagType.FINANCIAL_REQUEST, "No monetary or credential demand found", 0)
                    ),
                    "No immediate scam indicators detected. Practice standard digital hygiene.",
                    timestamp
            );
        }

        // 3. MEDIUM risk case (Job scam / Delivery / Investment buzz)
        if (lower.contains("job") || lower.contains("work from home") || lower.contains("package delivery")
                || lower.contains("courier") || lower.contains("amazon gift") || lower.contains("test-medium")) {
            return new ScanResponse(
                    scanId,
                    RiskLevel.MEDIUM,
                    58,
                    lower.contains("package") || lower.contains("delivery") ? ScamCategory.DELIVERY_SCAM : ScamCategory.JOB_SCAM,
                    List.of(
                            new RedFlag(RedFlagType.TOO_GOOD_TO_BE_TRUE, "Unrealistic compensation or unclaimed parcel claim", 65),
                            new RedFlag(RedFlagType.UNSOLICITED_CONTACT, "Unsolicited promotional outreach", 55),
                            new RedFlag(RedFlagType.SUSPICIOUS_LINK, "External non-standard communication channel requested", 50)
                    ),
                    "Exercise caution. Do not pay any registration fee or click delivery rescheduling links without independent verification.",
                    timestamp
            );
        }

        // 4. HIGH risk case (Default for KYC / Bank / UPI / Lottery scams)
        ScamCategory category = ScamCategory.BANKING_KYC;
        if (lower.contains("upi") || lower.contains("paytm") || lower.contains("gpay") || lower.contains("phonepe")) {
            category = ScamCategory.UPI_PAYMENT;
        } else if (lower.contains("lottery") || lower.contains("won") || lower.contains("crore") || lower.contains("prize")) {
            category = ScamCategory.LOTTERY_PRIZE;
        } else if (lower.contains("sim") || lower.contains("telecom") || lower.contains("deactivated")) {
            category = ScamCategory.SIM_KYC_FRAUD;
        }

        List<RedFlag> redFlags = List.of(
                new RedFlag(RedFlagType.URGENCY, "Artificial deadline to induce panic (e.g. 'within 2 hours')", 95),
                new RedFlag(RedFlagType.IMPERSONATION, "Impersonates trusted institution or banking official", 92),
                new RedFlag(RedFlagType.SENSITIVE_INFO_REQUEST, "Prompts submission of PIN, OTP, or KYC documents", 97),
                new RedFlag(RedFlagType.SUSPICIOUS_LINK, "Includes disguised or unofficial destination link", 88)
        );

        return new ScanResponse(
                scanId,
                RiskLevel.HIGH,
                91,
                category,
                redFlags,
                "Do not click the link, share OTP/PIN/password, or send money. Contact your bank directly through their official website or telephone banking.",
                timestamp
        );
    }

    @Override
    public ScanResponse scanImage(ImageScanRequest request) {
        String s3Key = request.s3Key();
        log.info("MockScanService: Analyzing screenshot object (s3Key: {})", s3Key);

        String scanId = "01H" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase(Locale.ROOT);
        String timestamp = Instant.now().toString();

        // Multimodal analysis mock response for uploaded screenshot
        List<RedFlag> redFlags = List.of(
                new RedFlag(RedFlagType.IMPERSONATION, "Visual header mimics national banking portal font and emblem", 96),
                new RedFlag(RedFlagType.URGENCY, "Prominent red countdown banner threatening account freeze", 93),
                new RedFlag(RedFlagType.SENSITIVE_INFO_REQUEST, "Form captures Debit Card CVV and Net Banking MPIN", 98),
                new RedFlag(RedFlagType.GRAMMAR_INCONSISTENCY, "Spelling and grammatical anomalies in disclaimer footer", 72)
        );

        return new ScanResponse(
                scanId,
                RiskLevel.HIGH,
                94,
                ScamCategory.BANKING_KYC,
                redFlags,
                "Severe credential theft vector. Disconnect from the site immediately and do not enter any banking details or personal credentials.",
                timestamp
        );
    }

    @Override
    public UrlScanResponse scanUrl(UrlScanRequest request) {
        String url = request.url();
        log.info("MockScanService: Static heuristic analysis of URL: {}", url);

        String scanId = "URL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        String timestamp = Instant.now().toString();

        List<String> reasons = new ArrayList<>();
        String lower = url != null ? url.toLowerCase(Locale.ROOT).trim() : "";

        // Heuristic 1: No HTTPS
        if (!lower.startsWith("https://")) {
            reasons.add("Insecure transmission: No HTTPS encryption detected");
        }

        // Heuristic 2: Known shorteners
        for (String shortener : KNOWN_SHORTENERS) {
            if (lower.contains(shortener)) {
                reasons.add("Shortened URL: Destination hidden behind known masking service (" + shortener + ")");
                break;
            }
        }

        // Heuristic 3: IP literal
        if (IP_PATTERN.matcher(lower).find()) {
            reasons.add("Suspicious destination: Raw IP address used instead of reputable registered domain");
        }

        // Heuristic 4: Lookalike / typo-squatting keywords
        for (String brandKeyword : SUSPICIOUS_BRAND_KEYWORDS) {
            if (lower.contains(brandKeyword)) {
                reasons.add("Deceptive lookalike domain targeting Indian financial/identity services (" + brandKeyword + ")");
                break;
            }
        }

        // Heuristic 5: Excessive subdomains or weird TLDs
        if (lower.contains(".tk") || lower.contains(".xyz") || lower.contains(".top") || lower.contains(".buzz") || lower.contains(".work")) {
            reasons.add("High-risk top-level domain frequently associated with disposable phishing campaigns");
        }

        String verdict;
        if (reasons.isEmpty()) {
            verdict = "SAFE";
            reasons.add("Valid HTTPS protocol");
            reasons.add("Registered domain with reputable namespace");
            reasons.add("No homoglyph or lookalike patterns identified");
        } else if (reasons.size() >= 2) {
            verdict = "SUSPICIOUS";
        } else {
            verdict = "SUSPICIOUS";
        }

        return new UrlScanResponse(scanId, verdict, reasons, timestamp);
    }
}
