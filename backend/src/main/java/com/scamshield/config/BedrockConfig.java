package com.scamshield.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.core.client.config.ClientOverrideConfiguration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;

import java.time.Duration;

@Configuration
@ConditionalOnProperty(name = "scan.mode", havingValue = "BEDROCK")
public class BedrockConfig {

    private static final Logger log = LoggerFactory.getLogger(BedrockConfig.class);

    private final BedrockProperties properties;

    public BedrockConfig(BedrockProperties properties) {
        this.properties = properties;
    }

    @Bean
    @ConditionalOnMissingBean(BedrockRuntimeClient.class)
    public BedrockRuntimeClient bedrockRuntimeClient() {
        log.info("Initializing Amazon Bedrock Runtime Client in region: {} for model: {}",
                properties.getRegion(), properties.getModelId());

        ClientOverrideConfiguration overrideConfig = ClientOverrideConfiguration.builder()
                .apiCallTimeout(Duration.ofSeconds(properties.getTimeoutSeconds()))
                .apiCallAttemptTimeout(Duration.ofSeconds(properties.getTimeoutSeconds()))
                .build();

        return BedrockRuntimeClient.builder()
                .region(Region.of(properties.getRegion()))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .overrideConfiguration(overrideConfig)
                .build();
    }
}
