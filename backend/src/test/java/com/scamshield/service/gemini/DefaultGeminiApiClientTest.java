package com.scamshield.service.gemini;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.scamshield.config.GeminiProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class DefaultGeminiApiClientTest {

    private DefaultGeminiApiClient client;
    private GeminiProperties properties;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        properties = new GeminiProperties();
        properties.setApiKey("mock-gemini-key");
        properties.setModel("gemini-3.6-flash");
        properties.setTimeoutSeconds(10);
        properties.setBaseUrl("https://generativelanguage.googleapis.com");

        objectMapper = new ObjectMapper();
        client = new DefaultGeminiApiClient(properties, objectMapper, RestClient.builder());
    }

    @Test
    @DisplayName("Multimodal request payload formats inlineData with camelCase fields conforming to Google Gemini REST API")
    @SuppressWarnings("unchecked")
    void buildRequestPayloadWithImageUsesCamelCaseInlineData() {
        String base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        String mimeType = "image/png";

        Map<String, Object> payload = client.buildRequestPayload(
                "System instructions",
                "Analyze this image",
                base64Data,
                mimeType
        );

        assertThat(payload).isNotNull();
        assertThat(payload).containsKey("contents");

        List<Map<String, Object>> contents = (List<Map<String, Object>>) payload.get("contents");
        assertThat(contents).hasSize(1);

        Map<String, Object> userContent = contents.get(0);
        assertThat(userContent.get("role")).isEqualTo("user");

        List<Map<String, Object>> parts = (List<Map<String, Object>>) userContent.get("parts");
        assertThat(parts).hasSize(2);

        // First part must be inlineData (camelCase, NOT inline_data)
        Map<String, Object> imagePart = parts.get(0);
        assertThat(imagePart).containsKey("inlineData");
        assertThat(imagePart).doesNotContainKey("inline_data");

        Map<String, String> inlineData = (Map<String, String>) imagePart.get("inlineData");
        assertThat(inlineData).containsEntry("mimeType", "image/png");
        assertThat(inlineData).doesNotContainKey("mime_type");
        assertThat(inlineData).containsEntry("data", base64Data);

        // Second part is text prompt
        Map<String, Object> textPart = parts.get(1);
        assertThat(textPart).containsEntry("text", "Analyze this image");
    }

    @Test
    @DisplayName("Text-only request payload does not contain inlineData part")
    @SuppressWarnings("unchecked")
    void buildRequestPayloadTextOnlyDoesNotContainInlineData() {
        Map<String, Object> payload = client.buildRequestPayload(
                "System instructions",
                "Analyze this text message",
                null,
                null
        );

        assertThat(payload).isNotNull();
        List<Map<String, Object>> contents = (List<Map<String, Object>>) payload.get("contents");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) contents.get(0).get("parts");

        assertThat(parts).hasSize(1);
        assertThat(parts.get(0)).containsKey("text");
        assertThat(parts.get(0)).doesNotContainKey("inlineData");
        assertThat(parts.get(0)).doesNotContainKey("inline_data");
    }
}
