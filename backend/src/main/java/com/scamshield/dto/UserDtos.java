package com.scamshield.dto;

import java.util.Map;

public class UserDtos {

    public static class UserBootstrapRequest {
        private String userId;
        private String email;
        private String displayName;

        public UserBootstrapRequest() {}

        public UserBootstrapRequest(String userId, String email, String displayName) {
            this.userId = userId;
            this.email = email;
            this.displayName = displayName;
        }

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
    }

    public static class UserProfileResponse {
        private String userId;
        private String email;
        private String displayName;
        private String familyGroupId;
        private Map<String, Object> preferences;
        private Boolean onboardingCompleted;
        private String createdAt;
        private String updatedAt;

        public UserProfileResponse() {}

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        public String getFamilyGroupId() { return familyGroupId; }
        public void setFamilyGroupId(String familyGroupId) { this.familyGroupId = familyGroupId; }
        public Map<String, Object> getPreferences() { return preferences; }
        public void setPreferences(Map<String, Object> preferences) { this.preferences = preferences; }
        public Boolean getOnboardingCompleted() { return onboardingCompleted; }
        public void setOnboardingCompleted(Boolean onboardingCompleted) { this.onboardingCompleted = onboardingCompleted; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
        public String getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class UserUpdateRequest {
        private String displayName;
        private Boolean onboardingCompleted;

        public UserUpdateRequest() {}

        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        public Boolean getOnboardingCompleted() { return onboardingCompleted; }
        public void setOnboardingCompleted(Boolean onboardingCompleted) { this.onboardingCompleted = onboardingCompleted; }
    }
}
