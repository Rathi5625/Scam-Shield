package com.scamshield.service.gemini;

public interface GeminiApiClient {
    /**
     * Calls Google Gemini generateContent with structured JSON schema.
     *
     * @param systemInstruction System instruction with forensic guidelines and prompt injection defenses
     * @param userPrompt Untrusted content wrapped in boundary delimiters
     * @param imageBase64 Optional base64 encoded image for multimodal scanning (nullable)
     * @param mimeType Optional MIME type of image (e.g. image/png, image/jpeg, image/webp)
     * @return Raw JSON text response from candidate output, or null if failed
     */
    String generateStructuredContent(
            String systemInstruction,
            String userPrompt,
            String imageBase64,
            String mimeType
    );
}
