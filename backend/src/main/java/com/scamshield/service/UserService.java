package com.scamshield.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scamshield.dto.UserDtos.UserBootstrapRequest;
import com.scamshield.dto.UserDtos.UserProfileResponse;
import com.scamshield.dto.UserDtos.UserUpdateRequest;
import com.scamshield.model.UserEntity;
import com.scamshield.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public UserService(UserRepository userRepository, ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    public UserProfileResponse bootstrapUser(UserBootstrapRequest req) {
        if (req.getUserId() == null || req.getUserId().trim().isEmpty()) {
            throw new IllegalArgumentException("userId is required for bootstrap");
        }

        Optional<UserEntity> existing = userRepository.findById(req.getUserId());
        if (existing.isPresent()) {
            return toResponse(existing.get());
        }

        // Create new user profile
        UserEntity newUser = new UserEntity(
                req.getUserId(),
                req.getEmail() != null ? req.getEmail() : req.getUserId() + "@scamshield.internal",
                req.getDisplayName() != null ? req.getDisplayName() : "Operative"
        );

        Map<String, Object> defaultPrefs = new HashMap<>();
        defaultPrefs.put("aggressivePhishingShield", true);
        defaultPrefs.put("realtimeHeuristics", true);
        defaultPrefs.put("familyAlerts", true);
        defaultPrefs.put("ephemeralLogging", true);

        try {
            newUser.setPreferencesJson(objectMapper.writeValueAsString(defaultPrefs));
        } catch (Exception e) {
            log.warn("Failed to serialize default preferences: {}", e.getMessage());
        }

        UserEntity saved = userRepository.save(newUser);
        log.info("Bootstrapped new user: {}", saved.getUserId());
        return toResponse(saved);
    }

    public Optional<UserProfileResponse> getUser(String userId) {
        return userRepository.findById(userId).map(this::toResponse);
    }

    public UserProfileResponse updateProfile(String userId, UserUpdateRequest req) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (req.getDisplayName() != null && !req.getDisplayName().trim().isEmpty()) {
            user.setDisplayName(req.getDisplayName().trim());
        }
        if (req.getOnboardingCompleted() != null) {
            user.setOnboardingCompleted(req.getOnboardingCompleted());
        }
        user.setUpdatedAt(Instant.now().toString());

        UserEntity updated = userRepository.save(user);
        return toResponse(updated);
    }

    public UserProfileResponse updatePreferences(String userId, Map<String, Object> prefs) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        try {
            Map<String, Object> current = parsePreferences(user.getPreferencesJson());
            current.putAll(prefs);
            user.setPreferencesJson(objectMapper.writeValueAsString(current));
            user.setUpdatedAt(Instant.now().toString());
            UserEntity updated = userRepository.save(user);
            return toResponse(updated);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update preferences: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> parsePreferences(String json) {
        if (json == null || json.trim().isEmpty()) return new HashMap<>();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private UserProfileResponse toResponse(UserEntity entity) {
        UserProfileResponse res = new UserProfileResponse();
        res.setUserId(entity.getUserId());
        res.setEmail(entity.getEmail());
        res.setDisplayName(entity.getDisplayName());
        res.setFamilyGroupId(entity.getFamilyGroupId());
        res.setPreferences(parsePreferences(entity.getPreferencesJson()));
        res.setOnboardingCompleted(Boolean.TRUE.equals(entity.getOnboardingCompleted()));
        res.setCreatedAt(entity.getCreatedAt());
        res.setUpdatedAt(entity.getUpdatedAt());
        return res;
    }
}
