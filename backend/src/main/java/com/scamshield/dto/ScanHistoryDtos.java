package com.scamshield.dto;

import java.util.List;
import java.util.Map;

public class ScanHistoryDtos {

    public static class SaveScanRequest {
        private String userId;
        private String scanType;        // TEXT | IMAGE | URL
        private String inputSummary;
        private String riskLevel;
        private Integer riskScore;
        private String category;
        private List<Object> redFlags;
        private String action;
        private String groupId;
        private String sharedBy;
        private String s3Key;

        public SaveScanRequest() {}

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getScanType() { return scanType; }
        public void setScanType(String scanType) { this.scanType = scanType; }
        public String getInputSummary() { return inputSummary; }
        public void setInputSummary(String inputSummary) { this.inputSummary = inputSummary; }
        public String getRiskLevel() { return riskLevel; }
        public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
        public Integer getRiskScore() { return riskScore; }
        public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public List<Object> getRedFlags() { return redFlags; }
        public void setRedFlags(List<Object> redFlags) { this.redFlags = redFlags; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getGroupId() { return groupId; }
        public void setGroupId(String groupId) { this.groupId = groupId; }
        public String getSharedBy() { return sharedBy; }
        public void setSharedBy(String sharedBy) { this.sharedBy = sharedBy; }
        public String getS3Key() { return s3Key; }
        public void setS3Key(String s3Key) { this.s3Key = s3Key; }
    }

    public static class ScanHistoryItemResponse {
        private String scanId;
        private String userId;
        private String scanType;
        private String inputSummary;
        private String riskLevel;
        private Integer riskScore;
        private String category;
        private List<Object> redFlags;
        private String action;
        private String groupId;
        private String sharedBy;
        private String s3Key;
        private String createdAt;

        public ScanHistoryItemResponse() {}

        public String getScanId() { return scanId; }
        public void setScanId(String scanId) { this.scanId = scanId; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getScanType() { return scanType; }
        public void setScanType(String scanType) { this.scanType = scanType; }
        public String getInputSummary() { return inputSummary; }
        public void setInputSummary(String inputSummary) { this.inputSummary = inputSummary; }
        public String getRiskLevel() { return riskLevel; }
        public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
        public Integer getRiskScore() { return riskScore; }
        public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public List<Object> getRedFlags() { return redFlags; }
        public void setRedFlags(List<Object> redFlags) { this.redFlags = redFlags; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getGroupId() { return groupId; }
        public void setGroupId(String groupId) { this.groupId = groupId; }
        public String getSharedBy() { return sharedBy; }
        public void setSharedBy(String sharedBy) { this.sharedBy = sharedBy; }
        public String getS3Key() { return s3Key; }
        public void setS3Key(String s3Key) { this.s3Key = s3Key; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class ScanHistoryListResponse {
        private List<ScanHistoryItemResponse> items;
        private int totalCount;
        private String nextCursor;

        public ScanHistoryListResponse() {}

        public ScanHistoryListResponse(List<ScanHistoryItemResponse> items, int totalCount, String nextCursor) {
            this.items = items;
            this.totalCount = totalCount;
            this.nextCursor = nextCursor;
        }

        public List<ScanHistoryItemResponse> getItems() { return items; }
        public void setItems(List<ScanHistoryItemResponse> items) { this.items = items; }
        public int getTotalCount() { return totalCount; }
        public void setTotalCount(int totalCount) { this.totalCount = totalCount; }
        public String getNextCursor() { return nextCursor; }
        public void setNextCursor(String nextCursor) { this.nextCursor = nextCursor; }
    }
}
