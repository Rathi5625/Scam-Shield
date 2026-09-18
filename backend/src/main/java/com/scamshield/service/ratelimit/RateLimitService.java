package com.scamshield.service.ratelimit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory sliding window rate limiter.
 * Protects AI scan inference, family invitations, and emergency lockdown broadcasts.
 * Thread-safe and configurable per client/user identity.
 */
@Service
public class RateLimitService {

    private static final Logger log = LoggerFactory.getLogger(RateLimitService.class);

    private final Map<String, Deque<Long>> requestWindows = new ConcurrentHashMap<>();

    @Value("${ratelimit.scan-per-minute:60}")
    private int scanPerMinute;

    @Value("${ratelimit.family-per-minute:30}")
    private int familyPerMinute;

    public boolean tryAcquire(String clientIdentifier, String actionCategory) {
        if (clientIdentifier == null || clientIdentifier.isBlank()) {
            clientIdentifier = "anonymous";
        }

        int maxAllowed = switch (actionCategory.toUpperCase()) {
            case "SCAN" -> scanPerMinute;
            case "FAMILY" -> familyPerMinute;
            default -> 60;
        };

        long now = Instant.now().toEpochMilli();
        long windowStart = now - 60_000L; // 60-second sliding window

        String compositeKey = actionCategory.toUpperCase() + ":" + clientIdentifier;

        Deque<Long> timestamps = requestWindows.computeIfAbsent(compositeKey, k -> new ArrayDeque<>());

        synchronized (timestamps) {
            // Evict timestamps older than 60 seconds
            while (!timestamps.isEmpty() && timestamps.peekFirst() < windowStart) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= maxAllowed) {
                log.warn("Rate limit exceeded for key '{}' in category '{}' (count: {}, max: {})",
                        clientIdentifier, actionCategory, timestamps.size(), maxAllowed);
                return false;
            }

            timestamps.addLast(now);
            return true;
        }
    }

    /**
     * Resets all rate limit windows.
     * Used primarily for test suite isolation.
     */
    public void reset() {
        requestWindows.clear();
        log.debug("RateLimitService windows reset.");
    }

    public void setScanLimit(int limit) {
        this.scanPerMinute = limit;
    }

    public void setFamilyLimit(int limit) {
        this.familyPerMinute = limit;
    }

    public int getScanLimit() {
        return scanPerMinute;
    }

    public int getFamilyLimit() {
        return familyPerMinute;
    }
}
