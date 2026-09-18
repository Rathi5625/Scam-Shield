package com.scamshield.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.scamshield.service.gemini.DefaultGeminiApiClient;
import com.scamshield.service.gemini.GeminiApiClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class GeminiConfig {

    @Bean
    @ConditionalOnMissingBean(GeminiApiClient.class)
    public GeminiApiClient geminiApiClient(
            GeminiProperties properties,
            ObjectMapper objectMapper,
            RestClient.Builder restClientBuilder) {
        return new DefaultGeminiApiClient(properties, objectMapper, restClientBuilder);
    }
}
