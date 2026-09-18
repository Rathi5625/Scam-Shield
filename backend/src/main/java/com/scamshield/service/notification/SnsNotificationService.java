package com.scamshield.service.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.PublishResponse;
import software.amazon.awssdk.services.sns.model.SnsException;

import java.time.Instant;
import java.util.Map;

/**
 * Amazon SNS Cloud Implementation of NotificationService.
 * Publishes strictly sanitized threat telemetry to the configured SNS Topic.
 * Never includes raw messages, image bytes, credentials, or PII.
 */
@Service
@ConditionalOnProperty(name = "notification.mode", havingValue = "SNS")
public class SnsNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(SnsNotificationService.class);

    private final SnsClient snsClient;
    private final ObjectMapper objectMapper;

    @Value("${aws.sns.topic-arn:}")
    private String topicArn;

    @Autowired
    public SnsNotificationService(SnsClient snsClient, ObjectMapper objectMapper) {
        this.snsClient = snsClient;
        this.objectMapper = objectMapper;
    }

    public SnsNotificationService(SnsClient snsClient, String topicArn, ObjectMapper objectMapper) {
        this.snsClient = snsClient;
        this.topicArn = topicArn;
        this.objectMapper = objectMapper;
    }

    @Override
    public NotificationResult sendThreatAlert(ThreatAlertEvent event) {
        if (event == null) {
            return NotificationResult.failure("SNS", "Event payload cannot be null");
        }
        if (topicArn == null || topicArn.isBlank()) {
            log.warn("SnsNotificationService: Topic ARN is not configured. Suppressing SNS dispatch.");
            return NotificationResult.failure("SNS", "SNS Topic ARN is not configured");
        }

        try {
            // Strictly sanitized payload: NO raw text, NO passwords/OTPs, NO image bytes
            Map<String, Object> payload = Map.of(
                    "eventType", "HIGH_RISK_SCAN",
                    "eventId", event.eventId(),
                    "scanId", event.scanId() != null ? event.scanId() : "none",
                    "familyGroupId", event.familyGroupId() != null ? event.familyGroupId() : "none",
                    "sharedBy", event.sharedBy() != null ? event.sharedBy() : "Anonymous",
                    "riskLevel", event.riskLevel(),
                    "riskScore", event.riskScore(),
                    "threatCategory", event.category(),
                    "engine", event.engine() != null ? event.engine() : "ScamShield Threat Engine",
                    "timestamp", event.createdAt() != null ? event.createdAt() : Instant.now().toString()
            );

            String messageJson = objectMapper.writeValueAsString(payload);
            PublishRequest publishRequest = PublishRequest.builder()
                    .topicArn(topicArn)
                    .subject("ScamShield Threat Intercept Alert: " + event.riskLevel())
                    .message(messageJson)
                    .build();

            PublishResponse response = snsClient.publish(publishRequest);
            log.info("Published sanitized threat alert to SNS topic {}: messageId={}", topicArn, response.messageId());
            return NotificationResult.success("SNS", response.messageId());

        } catch (SnsException e) {
            log.warn("SNS publish failed: HTTP {} - {}", e.statusCode(), e.awsErrorDetails().errorMessage());
            return NotificationResult.failure("SNS", e.awsErrorDetails().errorMessage());
        } catch (Exception e) {
            log.warn("Unexpected error publishing to SNS: {}", e.getMessage());
            return NotificationResult.failure("SNS", e.getMessage());
        }
    }

    @Override
    public NotificationResult sendLockdownAlert(LockdownAlertEvent event) {
        if (event == null) {
            return NotificationResult.failure("SNS", "Event payload cannot be null");
        }
        if (topicArn == null || topicArn.isBlank()) {
            log.warn("SnsNotificationService: Topic ARN is not configured. Suppressing SNS dispatch.");
            return NotificationResult.failure("SNS", "SNS Topic ARN is not configured");
        }

        try {
            Map<String, Object> payload = Map.of(
                    "eventType", "EMERGENCY_LOCKDOWN",
                    "eventId", event.eventId(),
                    "familyGroupId", event.familyGroupId(),
                    "triggeredBy", event.triggeredBy(),
                    "active", event.active(),
                    "timestamp", event.createdAt() != null ? event.createdAt() : Instant.now().toString()
            );

            String messageJson = objectMapper.writeValueAsString(payload);
            PublishRequest publishRequest = PublishRequest.builder()
                    .topicArn(topicArn)
                    .subject("ScamShield Emergency Lockdown Alert: " + (event.active() ? "ACTIVATED" : "DEACTIVATED"))
                    .message(messageJson)
                    .build();

            PublishResponse response = snsClient.publish(publishRequest);
            log.info("Published lockdown alert to SNS topic {}: messageId={}", topicArn, response.messageId());
            return NotificationResult.success("SNS", response.messageId());

        } catch (SnsException e) {
            log.warn("SNS lockdown alert failed: HTTP {} - {}", e.statusCode(), e.awsErrorDetails().errorMessage());
            return NotificationResult.failure("SNS", e.awsErrorDetails().errorMessage());
        } catch (Exception e) {
            log.warn("Unexpected error publishing lockdown to SNS: {}", e.getMessage());
            return NotificationResult.failure("SNS", e.getMessage());
        }
    }
}
