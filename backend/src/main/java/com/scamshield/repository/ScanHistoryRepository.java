package com.scamshield.repository;

import com.scamshield.model.ScanHistoryEntity;

import java.util.List;
import java.util.Optional;

public interface ScanHistoryRepository {
    ScanHistoryEntity save(ScanHistoryEntity scan);
    Optional<ScanHistoryEntity> findByUserIdAndScanId(String userId, String scanId);
    List<ScanHistoryEntity> findByUserId(String userId, int limit);
    void deleteByUserIdAndScanId(String userId, String scanId);
    int deleteByUserId(String userId);
    List<ScanHistoryEntity> findByGroupId(String groupId, int limit);
    void clearAll();
}
