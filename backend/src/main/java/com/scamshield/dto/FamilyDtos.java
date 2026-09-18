package com.scamshield.dto;

import java.util.List;
import java.util.Map;

public class FamilyDtos {

    public static class CreateFamilyGroupRequest {
        private String groupName;
        private String ownerId;
        private String ownerName;
        private String ownerEmail;

        public CreateFamilyGroupRequest() {}

        public String getGroupName() { return groupName; }
        public void setGroupName(String groupName) { this.groupName = groupName; }
        public String getOwnerId() { return ownerId; }
        public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
        public String getOwnerName() { return ownerName; }
        public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
        public String getOwnerEmail() { return ownerEmail; }
        public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
    }

    public static class FamilyMemberDto {
        private String id;
        private String userId;
        private String displayName;
        private String email;
        private String role;           // OWNER | ADMIN | MEMBER | WARD
        private String status;         // ACTIVE | INVITED | INACTIVE
        private String joinedAt;
        private String relationship;
        private String deviceInfo;
        private String defenseState;
        private int activeThreatsCount;
        private String avatarUrl;

        public FamilyMemberDto() {}

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getJoinedAt() { return joinedAt; }
        public void setJoinedAt(String joinedAt) { this.joinedAt = joinedAt; }
        public String getRelationship() { return relationship; }
        public void setRelationship(String relationship) { this.relationship = relationship; }
        public String getDeviceInfo() { return deviceInfo; }
        public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }
        public String getDefenseState() { return defenseState; }
        public void setDefenseState(String defenseState) { this.defenseState = defenseState; }
        public int getActiveThreatsCount() { return activeThreatsCount; }
        public void setActiveThreatsCount(int activeThreatsCount) { this.activeThreatsCount = activeThreatsCount; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }

    public static class FamilyGroupResponse {
        private String groupId;
        private String ownerId;
        private String groupName;
        private List<FamilyMemberDto> members;
        private Boolean emergencyLockdownActive;
        private String emergencyLockdownActivatedAt;
        private Map<String, Object> protectionSettings;
        private String createdAt;

        public FamilyGroupResponse() {}

        public String getGroupId() { return groupId; }
        public void setGroupId(String groupId) { this.groupId = groupId; }
        public String getOwnerId() { return ownerId; }
        public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
        public String getGroupName() { return groupName; }
        public void setGroupName(String groupName) { this.groupName = groupName; }
        public List<FamilyMemberDto> getMembers() { return members; }
        public void setMembers(List<FamilyMemberDto> members) { this.members = members; }
        public Boolean getEmergencyLockdownActive() { return emergencyLockdownActive; }
        public void setEmergencyLockdownActive(Boolean emergencyLockdownActive) { this.emergencyLockdownActive = emergencyLockdownActive; }
        public String getEmergencyLockdownActivatedAt() { return emergencyLockdownActivatedAt; }
        public void setEmergencyLockdownActivatedAt(String emergencyLockdownActivatedAt) { this.emergencyLockdownActivatedAt = emergencyLockdownActivatedAt; }
        public Map<String, Object> getProtectionSettings() { return protectionSettings; }
        public void setProtectionSettings(Map<String, Object> protectionSettings) { this.protectionSettings = protectionSettings; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class InviteMemberRequest {
        private String groupId;
        private String invitedBy;
        private String email;
        private String relationship;

        public InviteMemberRequest() {}

        public String getGroupId() { return groupId; }
        public void setGroupId(String groupId) { this.groupId = groupId; }
        public String getInvitedBy() { return invitedBy; }
        public void setInvitedBy(String invitedBy) { this.invitedBy = invitedBy; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRelationship() { return relationship; }
        public void setRelationship(String relationship) { this.relationship = relationship; }
    }

    public static class FamilyInviteResponse {
        private String inviteId;
        private String groupId;
        private String invitedBy;
        private String invitedEmail;
        private String relationship;
        private String status;
        private String createdAt;
        private String expiresAt;

        public FamilyInviteResponse() {}

        public String getInviteId() { return inviteId; }
        public void setInviteId(String inviteId) { this.inviteId = inviteId; }
        public String getGroupId() { return groupId; }
        public void setGroupId(String groupId) { this.groupId = groupId; }
        public String getInvitedBy() { return invitedBy; }
        public void setInvitedBy(String invitedBy) { this.invitedBy = invitedBy; }
        public String getInvitedEmail() { return invitedEmail; }
        public void setInvitedEmail(String invitedEmail) { this.invitedEmail = invitedEmail; }
        public String getRelationship() { return relationship; }
        public void setRelationship(String relationship) { this.relationship = relationship; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
        public String getExpiresAt() { return expiresAt; }
        public void setExpiresAt(String expiresAt) { this.expiresAt = expiresAt; }
    }

    public static class AcceptInviteRequest {
        private String memberDisplayName;
        private String memberUserId;

        public AcceptInviteRequest() {}

        public String getMemberDisplayName() { return memberDisplayName; }
        public void setMemberDisplayName(String memberDisplayName) { this.memberDisplayName = memberDisplayName; }
        public String getMemberUserId() { return memberUserId; }
        public void setMemberUserId(String memberUserId) { this.memberUserId = memberUserId; }
    }

    public static class UpdateMemberRoleRequest {
        private String newRole;
        private String requesterUserId;

        public UpdateMemberRoleRequest() {}

        public String getNewRole() { return newRole; }
        public void setNewRole(String newRole) { this.newRole = newRole; }
        public String getRequesterUserId() { return requesterUserId; }
        public void setRequesterUserId(String requesterUserId) { this.requesterUserId = requesterUserId; }
    }

    public static class ShareThreatRequest {
        private String familyGroupId;
        private String sharedBy;
        private String scanType;
        private String riskLevel;
        private Integer riskScore;
        private String category;
        private String summary;
        private String vector;
        private String exposureStatus;

        public ShareThreatRequest() {}

        public String getFamilyGroupId() { return familyGroupId; }
        public void setFamilyGroupId(String familyGroupId) { this.familyGroupId = familyGroupId; }
        public String getSharedBy() { return sharedBy; }
        public void setSharedBy(String sharedBy) { this.sharedBy = sharedBy; }
        public String getScanType() { return scanType; }
        public void setScanType(String scanType) { this.scanType = scanType; }
        public String getRiskLevel() { return riskLevel; }
        public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
        public Integer getRiskScore() { return riskScore; }
        public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
        public String getVector() { return vector; }
        public void setVector(String vector) { this.vector = vector; }
        public String getExposureStatus() { return exposureStatus; }
        public void setExposureStatus(String exposureStatus) { this.exposureStatus = exposureStatus; }
    }

    public static class ThreatShareResponse {
        private String id;
        private String familyGroupId;
        private String sharedBy;
        private String scanType;
        private String riskLevel;
        private Integer riskScore;
        private String category;
        private String summary;
        private String vector;
        private String exposureStatus;
        private String createdAt;

        public ThreatShareResponse() {}

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getFamilyGroupId() { return familyGroupId; }
        public void setFamilyGroupId(String familyGroupId) { this.familyGroupId = familyGroupId; }
        public String getSharedBy() { return sharedBy; }
        public void setSharedBy(String sharedBy) { this.sharedBy = sharedBy; }
        public String getScanType() { return scanType; }
        public void setScanType(String scanType) { this.scanType = scanType; }
        public String getRiskLevel() { return riskLevel; }
        public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
        public Integer getRiskScore() { return riskScore; }
        public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
        public String getVector() { return vector; }
        public void setVector(String vector) { this.vector = vector; }
        public String getExposureStatus() { return exposureStatus; }
        public void setExposureStatus(String exposureStatus) { this.exposureStatus = exposureStatus; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }
}
