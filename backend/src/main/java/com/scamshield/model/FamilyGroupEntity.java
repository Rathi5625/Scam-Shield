package com.scamshield.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

@DynamoDbBean
public class FamilyGroupEntity {

    private String groupId;
    private String ownerId;
    private String groupName;
    private String membersJson;
    private Boolean emergencyLockdownActive;
    private String emergencyLockdownActivatedAt;
    private String protectionSettingsJson;
    private String createdAt;

    public FamilyGroupEntity() {
    }

    @DynamoDbPartitionKey
    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public String getMembersJson() {
        return membersJson;
    }

    public void setMembersJson(String membersJson) {
        this.membersJson = membersJson;
    }

    public Boolean getEmergencyLockdownActive() {
        return emergencyLockdownActive;
    }

    public void setEmergencyLockdownActive(Boolean emergencyLockdownActive) {
        this.emergencyLockdownActive = emergencyLockdownActive;
    }

    public String getEmergencyLockdownActivatedAt() {
        return emergencyLockdownActivatedAt;
    }

    public void setEmergencyLockdownActivatedAt(String emergencyLockdownActivatedAt) {
        this.emergencyLockdownActivatedAt = emergencyLockdownActivatedAt;
    }

    public String getProtectionSettingsJson() {
        return protectionSettingsJson;
    }

    public void setProtectionSettingsJson(String protectionSettingsJson) {
        this.protectionSettingsJson = protectionSettingsJson;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
