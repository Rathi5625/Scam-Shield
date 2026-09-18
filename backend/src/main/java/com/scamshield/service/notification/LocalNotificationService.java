package com.scamshield.service.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Safe local implementation of NotificationService.
 * Records notification events in memory for audit/testing and logs strictly sanitized metrics.
 * Never contacts AWS or leaks raw scanned content.
 */
@Service
@ConditionalOnProperty(name = "notification.mode", havingValue = "MOCK", matchIfMissing = true)
public class LocalNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(LocalNotificationService.class);

    private final List<ThreatAlertEvent> recordedThreatAlerts = Collections.synchronizedList(new ArrayList<>());
    private final List<LockdownAlertEvent> recordedLockdownAlerts = Collections.synchronizedList(new ArrayList<>());

    @Override
    public NotificationResult sendThreatAlert(ThreatAlertEvent event) {
        if (event == null) {
            return NotificationResult.failure("MOCK", "Event payload cannot be null");
        }

        recordedThreatAlerts.add(event);
        String mockMessageId = "mock-sns-" + UUID.randomUUID().toString().substring(0, 8);

        log.info("[LOCAL-NOTIFICATION] Threat Alert: eventId={}, group={}, riskLevel={}, riskScore={}, category={}, engine={}",
                event.eventId(), event.familyGroupId(), event.riskLevel(), event.riskScore(), event.category(), event.engine());

        return NotificationResult.success("MOCK", mockMessageId);
    }

    @Override
    public NotificationResult sendLockdownAlert(LockdownAlertEvent event) {
        if (event == null) {
            return NotificationResult.failure("MOCK", "Event payload cannot be null");
        }

        recordedLockdownAlerts.add(event);
        String mockMessageId = "mock-sns-lockdown-" + UUID.randomUUID().toString().substring(0, 8);

        log.info("[LOCAL-NOTIFICATION] Emergency Lockdown Broadcast: eventId={}, group={}, active={}, triggeredBy={}",
                event.eventId(), event.familyGroupId(), event.active(), event.triggeredBy());

        return NotificationResult.success("MOCK", mockMessageId);
    }

    public List<ThreatAlertEvent> getRecordedThreatAlerts() {
        return Collections.unmodifiableList(recordedThreatAlerts);
    }

    public List<LockdownAlertEvent> getRecordedLockdownAlerts() {
        return Collections.unmodifiableList(recordedLockdownAlerts);
    }

    public void clearAuditLogs() {
        recordedThreatAlerts.clear();
        recordedLockdownAlerts.clear();
    }
}
