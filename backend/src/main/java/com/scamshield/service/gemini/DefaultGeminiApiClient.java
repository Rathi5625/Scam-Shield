package com.scamshield.service.gemini;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scamshield.config.GeminiProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Production-grade Gemini API client using Google's official Gemini REST API (v1beta).
 * Enforces structured JSON output schema and strict zero-exposure secret handling.
 */
public class DefaultGeminiApiClient implements GeminiApiClient {

    private static final Logger log = LoggerFactory.getLogger(DefaultGeminiApiClient.class);

    private final GeminiProperties properties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public DefaultGeminiApiClient(GeminiProperties properties, ObjectMapper objectMapper, RestClient.Builder restClientBuilder) {
        this.properties = properties;
        this.objectMapper = objectMapper;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        int timeoutMs = Math.max(5, properties.getTimeoutSeconds()) * 1000;
        requestFactory.setConnectTimeout(timeoutMs);
        requestFactory.setReadTimeout(timeoutMs);

        String baseUrl = properties.getBaseUrl() != null && !properties.getBaseUrl().isBlank()
                ? properties.getBaseUrl()
                : "https://generativelanguage.googleapis.com";

        this.restClient = restClientBuilder
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .build();
    }

    @Override
    public String generateStructuredContent(
            String systemInstruction,
            String userPrompt,
            String imageBase64,
            String mimeType) {

        if (!properties.isConfigured()) {
            log.warn("DefaultGeminiApiClient: GEMINI_API_KEY is not configured. Request cannot be dispatched.");
            return null;
        }

        try {
            Map<String, Object> payload = buildRequestPayload(systemInstruction, userPrompt, imageBase64, mimeType);
            String uri = "/v1beta/models/" + properties.getModel() + ":generateContent";

            log.debug("DefaultGeminiApiClient: Dispatching generateContent to model: {}", properties.getModel());

            String responseBody = restClient.post()
                    .uri(uri)
                    .header("x-goog-api-key", properties.getApiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> {
                        int code = resp.getStatusCode().value();
                        if (code == 401 || code == 403) {
                            log.error("DefaultGeminiApiClient: Gemini API authentication failed (HTTP {}). Check GEMINI_API_KEY validity.", code);
                        } else if (code == 429) {
                            log.warn("DefaultGeminiApiClient: Gemini API rate limit exceeded (HTTP 429).");
                        } else {
                            log.warn("DefaultGeminiApiClient: Gemini API returned HTTP status {}", code);
                        }
                    })
                    .body(String.class);

            return extractCandidateText(responseBody);

        } catch (RestClientResponseException e) {
            log.warn("DefaultGeminiApiClient: REST response error (HTTP {}): {}", e.getStatusCode(), e.getStatusText());
            return null;
        } catch (Exception e) {
            log.error("DefaultGeminiApiClient: Communication error with Gemini API: {}", e.getMessage());
            return null;
        }
    }

    private Map<String, Object> buildRequestPayload(
            String systemInstruction,
            String userPrompt,
            String imageBase64,
            String mimeType) {

        Map<String, Object> responseSchema = Map.of(
                "type", "OBJECT",
                "properties", Map.ofEntries(
                        Map.entry("riskLevel", Map.of("type", "STRING", "enum", List.of("HIGH", "MEDIUM", "LOW", "UNKNOWN"))),
                        Map.entry("riskScore", Map.of("type", "INTEGER")),
                        Map.entry("threatCategory", Map.of("type", "STRING")),
                        Map.entry("confidence", Map.of("type", "NUMBER")),
                        Map.entry("summary", Map.of("type", "STRING")),
                        Map.entry("explanation", Map.of("type", "STRING")),
                        Map.entry("redFlags", Map.of(
                                "type", "ARRAY",
                                "items", Map.of(
                                        "type", "OBJECT",
                                        "properties", Map.of(
                                                "type", Map.of("type", "STRING"),
                                                "label", Map.of("type", "STRING"),
                                                "score", Map.of("type", "INTEGER")
                                        ),
                                        "required", List.of("type", "label", "score")
                                )
                        )),
                        Map.entry("recommendedAction", Map.of("type", "STRING")),
                        Map.entry("indicators", Map.of("type", "ARRAY", "items", Map.of("type", "STRING")))
                ),
                "required", List.of("riskLevel", "riskScore", "threatCategory", "confidence", "summary", "redFlags", "recommendedAction")
        );

        Map<String, Object> generationConfig = Map.of(
                "temperature", 0.0,
                "responseMimeType", "application/json",
                "responseSchema", responseSchema
        );

        Map<String, Object> systemInstructionMap = Map.of(
                "parts", List.of(Map.of("text", systemInstruction))
        );

        List<Map<String, Object>> userParts = new ArrayList<>();
        if (imageBase64 != null && !imageBase64.isBlank()) {
            String safeMime = (mimeType != null && !mimeType.isBlank()) ? mimeType : "image/png";
            userParts.add(Map.of(
                    "inline_data", Map.of(
                            "mime_type", safeMime,
                            "data", imageBase64.trim()
                    )
            ));
        }
        userParts.add(Map.of("text", userPrompt != null ? userPrompt : ""));

        List<Map<String, Object>> contents = List.of(
                Map.of("role", "user", "parts", userParts)
        );

        return Map.of(
                "system_instruction", systemInstructionMap,
                "contents", contents,
                "generationConfig", generationConfig
        );
    }

    private String extractCandidateText(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return null;
        }

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode parts = firstCandidate.path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    JsonNode textNode = parts.get(0).path("text");
                    if (!textNode.isMissingNode()) {
                        return textNode.asText();
                    }
                }
            }
            log.warn("DefaultGeminiApiClient: Response did not contain candidate text parts");
            return null;
        } catch (Exception e) {
            log.warn("DefaultGeminiApiClient: Failed to parse candidate from Gemini response: {}", e.getMessage());
            return null;
        }
    }
}
