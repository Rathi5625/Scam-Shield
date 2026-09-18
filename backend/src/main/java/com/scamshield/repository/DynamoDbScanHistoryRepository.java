package com.scamshield.repository;

import com.scamshield.model.ScanHistoryEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbIndex;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class DynamoDbScanHistoryRepository implements ScanHistoryRepository {

    private static final Logger log = LoggerFactory.getLogger(DynamoDbScanHistoryRepository.class);

    private final DynamoDbTable<ScanHistoryEntity> table;
    private final Map<String, ScanHistoryEntity> fallbackStore = new ConcurrentHashMap<>();

    public DynamoDbScanHistoryRepository(
            DynamoDbEnhancedClient enhancedClient,
            @Value("${aws.dynamodb.tables.scans:ScamShield-ScanHistory-dev}") String tableName) {
        this.table = enhancedClient.table(tableName, TableSchema.fromBean(ScanHistoryEntity.class));
        log.info("Initialized DynamoDbScanHistoryRepository for table: {}", tableName);
    }

    private String compositeKey(String userId, String scanId) {
        return userId + "#" + scanId;
    }

    @Override
    public ScanHistoryEntity save(ScanHistoryEntity scan) {
        if (scan == null || scan.getUserId() == null || scan.getScanId() == null) {
            throw new IllegalArgumentException("Scan, userId, and scanId must not be null");
        }
        fallbackStore.put(compositeKey(scan.getUserId(), scan.getScanId()), scan);
        try {
            table.putItem(scan);
            log.debug("Persisted ScanHistory record {} for user {}", scan.getScanId(), scan.getUserId());
        } catch (Exception e) {
            log.debug("DynamoDB put ScanHistory failed ({}), retained in fallback store", e.getMessage());
        }
        return scan;
    }

    @Override
    public Optional<ScanHistoryEntity> findByUserIdAndScanId(String userId, String scanId) {
        if (userId == null || scanId == null) return Optional.empty();
        try {
            ScanHistoryEntity item = table.getItem(Key.builder()
                    .partitionValue(userId)
                    .sortValue(scanId)
                    .build());
            if (item != null) return Optional.of(item);
        } catch (Exception e) {
            log.debug("DynamoDB get ScanHistory failed ({})", e.getMessage());
        }
        return Optional.ofNullable(fallbackStore.get(compositeKey(userId, scanId)));
    }

    @Override
    public List<ScanHistoryEntity> findByUserId(String userId, int limit) {
        if (userId == null) return List.of();
        List<ScanHistoryEntity> results = new ArrayList<>();
        try {
            QueryConditional queryConditional = QueryConditional.keyEqualTo(Key.builder().partitionValue(userId).build());
            table.query(r -> r.queryConditional(queryConditional).scanIndexForward(false).limit(limit))
                    .items()
                    .forEach(results::add);
            if (!results.isEmpty()) return results;
        } catch (Exception e) {
            log.debug("DynamoDB query ScanHistory by user failed ({})", e.getMessage());
        }

        // Fallback store
        return fallbackStore.values().stream()
                .filter(s -> userId.equals(s.getUserId()))
                .sorted(Comparator.comparing(ScanHistoryEntity::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(limit > 0 ? limit : 50)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteByUserIdAndScanId(String userId, String scanId) {
        if (userId == null || scanId == null) return;
        fallbackStore.remove(compositeKey(userId, scanId));
        try {
            table.deleteItem(Key.builder().partitionValue(userId).sortValue(scanId).build());
        } catch (Exception e) {
            log.debug("DynamoDB delete ScanHistory failed ({})", e.getMessage());
        }
    }

    @Override
    public int deleteByUserId(String userId) {
        if (userId == null) return 0;
        List<String> toRemove = fallbackStore.entrySet().stream()
                .filter(e -> userId.equals(e.getValue().getUserId()))
                .map(Map.Entry::getKey)
                .toList();

        for (String key : toRemove) {
            ScanHistoryEntity entity = fallbackStore.remove(key);
            if (entity != null) {
                try {
                    table.deleteItem(Key.builder().partitionValue(userId).sortValue(entity.getScanId()).build());
                } catch (Exception ignored) {
                }
            }
        }
        return toRemove.size();
    }

    @Override
    public List<ScanHistoryEntity> findByGroupId(String groupId, int limit) {
        if (groupId == null || groupId.trim().isEmpty()) return List.of();
        List<ScanHistoryEntity> results = new ArrayList<>();
        try {
            DynamoDbIndex<ScanHistoryEntity> index = table.index(ScanHistoryEntity.GROUP_INDEX);
            QueryConditional qc = QueryConditional.keyEqualTo(Key.builder().partitionValue(groupId).build());
            index.query(r -> r.queryConditional(qc).scanIndexForward(false).limit(limit))
                    .stream()
                    .flatMap(p -> p.items().stream())
                    .forEach(results::add);
            if (!results.isEmpty()) return results;
        } catch (Exception e) {
            log.debug("DynamoDB query GSI groupId-createdAt-index failed ({})", e.getMessage());
        }

        // Fallback store filter
        return fallbackStore.values().stream()
                .filter(s -> groupId.equals(s.getGroupId()))
                .sorted(Comparator.comparing(ScanHistoryEntity::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(limit > 0 ? limit : 50)
                .collect(Collectors.toList());
    }

    @Override
    public void clearAll() {
        fallbackStore.clear();
    }
}
