package com.scamshield.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AnonymousCredentialsProvider;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.DynamoDbClientBuilder;

import java.net.URI;

@Configuration
public class DynamoDbConfig {

    private static final Logger log = LoggerFactory.getLogger(DynamoDbConfig.class);

    @Value("${aws.region:ap-south-1}")
    private String awsRegion;

    @Value("${aws.dynamodb.endpoint:}")
    private String dynamodbEndpoint;

    @Bean
    public DynamoDbClient dynamoDbClient() {
        log.info("Configuring DynamoDbClient for region: {}", awsRegion);
        Region region = Region.of(awsRegion);
        DynamoDbClientBuilder builder = DynamoDbClient.builder()
                .region(region);

        if (dynamodbEndpoint != null && !dynamodbEndpoint.trim().isEmpty()) {
            try {
                log.info("DynamoDB endpoint override provided: {}", dynamodbEndpoint);
                builder.endpointOverride(URI.create(dynamodbEndpoint));
                // For local endpoint testing (e.g. LocalStack or DynamoDB Local), allow anonymous credentials
                builder.credentialsProvider(AnonymousCredentialsProvider.create());
            } catch (Exception e) {
                log.warn("Invalid DynamoDB endpoint URL: {}. Proceeding without override.", dynamodbEndpoint);
            }
        } else {
            try {
                AwsCredentialsProvider credentialsProvider = DefaultCredentialsProvider.create();
                builder.credentialsProvider(credentialsProvider);
            } catch (Exception e) {
                log.warn("DefaultCredentialsProvider could not be resolved immediately: {}. Using anonymous fallback.", e.getMessage());
                builder.credentialsProvider(AnonymousCredentialsProvider.create());
            }
        }

        try {
            return builder.build();
        } catch (Exception e) {
            log.error("Failed to construct DynamoDbClient: {}", e.getMessage());
            // Fallback client to avoid context startup failure
            return DynamoDbClient.builder()
                    .region(region)
                    .credentialsProvider(AnonymousCredentialsProvider.create())
                    .build();
        }
    }

    @Bean
    public DynamoDbEnhancedClient dynamoDbEnhancedClient(DynamoDbClient dynamoDbClient) {
        return DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();
    }
}
