package com.scamshield.service.notification;

/**
 * High-level security notification service.
 * Supports family threat alerts and emergency lockdown notifications
 * with strict payload sanitization and zero PII or raw content leakage.
 */
public interface NotificationService {

    record ThreatAlertEvent(
            String eventId,
            String scanId,
            String familyGroupId,
            String sharedBy,
            String riskLevel,
            int riskScore,
            String category,
            String engine,
            String createdAt
    ) {}

    record LockdownAlertEvent(
            String eventId,
            String familyGroupId,
            String triggeredBy,
            boolean active,
            String createdAt
    ) {}

    record NotificationResult(
            boolean delivered,
            String channel,       // MOCK | SNS
            String messageId,
            String errorDetail
    ) {
        public static NotificationResult success(String channel, String messageId) {
            return new NotificationResult(true, channel, messageId, null);
        }

        public static NotificationResult failure(String channel, String errorDetail) {
            return new NotificationResult(false, channel, null, errorDetail);
        }
    }

    /**
     * Sends a sanitized security threat alert to the family defense circle.
     */
    NotificationResult sendThreatAlert(ThreatAlertEvent event);

    /**
     * Sends an emergency lockdown broadcast to the family defense circle.
     */
    NotificationResult sendLockdownAlert(LockdownAlertEvent event);
}
