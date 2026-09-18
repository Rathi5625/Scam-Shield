package com.scamshield.service.notification;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import software.amazon.awssdk.awscore.exception.AwsErrorDetails;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.PublishResponse;
import software.amazon.awssdk.services.sns.model.SnsException;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class NotificationServiceTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    @Test
    void testLocalNotificationServicePublishesHighRiskAlert() {
        LocalNotificationService localService = new LocalNotificationService();

        NotificationService.ThreatAlertEvent event = new NotificationService.ThreatAlertEvent(
                "evt_123",
                "scan_123",
                "fam_789",
                "usr_456",
                "HIGH",
                92,
                "BANKING_KYC",
                "GeminiScanService",
                Instant.now().toString()
        );

        NotificationService.NotificationResult result = localService.sendThreatAlert(event);

        assertThat(result.delivered()).isTrue();
        assertThat(result.channel()).isEqualTo("MOCK");
        assertThat(result.messageId()).startsWith("mock-sns-");

        List<NotificationService.ThreatAlertEvent> log = localService.getRecordedThreatAlerts();
        assertThat(log).hasSize(1);
        assertThat(log.get(0).scanId()).isEqualTo("scan_123");
        assertThat(log.get(0).riskScore()).isEqualTo(92);
        assertThat(log.get(0).category()).isEqualTo("BANKING_KYC");
    }

    @Test
    void testLocalNotificationServiceLockdownAlert() {
        LocalNotificationService localService = new LocalNotificationService();

        NotificationService.LockdownAlertEvent lockdown = new NotificationService.LockdownAlertEvent(
                "evt_lockdown_1",
                "fam_789",
                "usr_owner",
                true,
                Instant.now().toString()
        );

        NotificationService.NotificationResult result = localService.sendLockdownAlert(lockdown);
        assertThat(result.delivered()).isTrue();
        assertThat(result.channel()).isEqualTo("MOCK");
        assertThat(result.messageId()).startsWith("mock-sns-lockdown-");

        List<NotificationService.LockdownAlertEvent> log = localService.getRecordedLockdownAlerts();
        assertThat(log).hasSize(1);
        assertThat(log.get(0).familyGroupId()).isEqualTo("fam_789");
        assertThat(log.get(0).active()).isTrue();
    }

    @Test
    void testLocalNotificationServiceNullPayloadHandling() {
        LocalNotificationService localService = new LocalNotificationService();

        NotificationService.NotificationResult threatResult = localService.sendThreatAlert(null);
        assertThat(threatResult.delivered()).isFalse();
        assertThat(threatResult.errorDetail()).contains("Event payload cannot be null");

        NotificationService.NotificationResult lockdownResult = localService.sendLockdownAlert(null);
        assertThat(lockdownResult.delivered()).isFalse();
        assertThat(lockdownResult.errorDetail()).contains("Event payload cannot be null");
    }

    @Test
    void testSnsNotificationServicePayloadSanitization() throws Exception {
        SnsClient mockSns = mock(SnsClient.class);
        PublishResponse mockResponse = PublishResponse.builder()
                .messageId("sns-msg-test-uuid-999")
                .build();
        when(mockSns.publish(any(PublishRequest.class))).thenReturn(mockResponse);

        String topicArn = "arn:aws:sns:ap-south-1:123456789012:scamshield-family-alerts";
        SnsNotificationService snsService = new SnsNotificationService(mockSns, topicArn, objectMapper);

        NotificationService.ThreatAlertEvent event = new NotificationService.ThreatAlertEvent(
                "evt_abc",
                "scan_abc",
                "fam_group_1",
                "usr_xyz",
                "HIGH",
                88,
                "UPI_PAYMENT",
                "Gemini 2.5 Flash",
                "2026-09-19T00:00:00Z"
        );

        NotificationService.NotificationResult result = snsService.sendThreatAlert(event);

        assertThat(result.delivered()).isTrue();
        assertThat(result.messageId()).isEqualTo("sns-msg-test-uuid-999");
        assertThat(result.channel()).isEqualTo("SNS");

        ArgumentCaptor<PublishRequest> captor = ArgumentCaptor.forClass(PublishRequest.class);
        verify(mockSns).publish(captor.capture());
        PublishRequest req = captor.getValue();

        assertThat(req.topicArn()).isEqualTo(topicArn);
        assertThat(req.subject()).contains("ScamShield Threat Intercept Alert: HIGH");

        // Parse message JSON and verify privacy invariants (no raw message text, no secret keys, no image bytes)
        JsonNode json = objectMapper.readTree(req.message());
        assertThat(json.get("eventType").asText()).isEqualTo("HIGH_RISK_SCAN");
        assertThat(json.get("scanId").asText()).isEqualTo("scan_abc");
        assertThat(json.get("riskLevel").asText()).isEqualTo("HIGH");
        assertThat(json.get("threatCategory").asText()).isEqualTo("UPI_PAYMENT");
        assertThat(json.get("riskScore").asInt()).isEqualTo(88);
        assertThat(json.get("familyGroupId").asText()).isEqualTo("fam_group_1");
        assertThat(json.has("rawMessage")).isFalse();
        assertThat(json.has("imageBytes")).isFalse();
    }

    @Test
    void testSnsNotificationServiceHandlesClientFailureGracefully() {
        SnsClient mockSns = mock(SnsClient.class);
        AwsErrorDetails awsError = AwsErrorDetails.builder()
                .errorMessage("Topic does not exist")
                .errorCode("NotFound")
                .build();
        SnsException snsException = (SnsException) SnsException.builder()
                .awsErrorDetails(awsError)
                .statusCode(404)
                .message("Topic does not exist")
                .build();
        when(mockSns.publish(any(PublishRequest.class))).thenThrow(snsException);

        SnsNotificationService snsService = new SnsNotificationService(
                mockSns,
                "arn:aws:sns:ap-south-1:123456789012:invalid-topic",
                objectMapper
        );

        NotificationService.ThreatAlertEvent event = new NotificationService.ThreatAlertEvent(
                "evt_fail",
                "scan_fail",
                "fam_fail",
                "usr_fail",
                "HIGH",
                90,
                "OTHER",
                "MockScanService",
                "2026-09-19T00:00:00Z"
        );

        // Should NOT throw an uncaught exception, should return failed result gracefully
        NotificationService.NotificationResult result = snsService.sendThreatAlert(event);
        assertThat(result.delivered()).isFalse();
        assertThat(result.channel()).isEqualTo("SNS");
        assertThat(result.errorDetail()).contains("Topic does not exist");
    }
}
