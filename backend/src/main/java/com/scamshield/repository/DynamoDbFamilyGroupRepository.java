package com.scamshield.repository;

import com.scamshield.model.FamilyGroupEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class DynamoDbFamilyGroupRepository implements FamilyGroupRepository {

    private static final Logger log = LoggerFactory.getLogger(DynamoDbFamilyGroupRepository.class);

    private final DynamoDbTable<FamilyGroupEntity> table;
    private final Map<String, FamilyGroupEntity> fallbackStore = new ConcurrentHashMap<>();

    public DynamoDbFamilyGroupRepository(
            DynamoDbEnhancedClient enhancedClient,
            @Value("${aws.dynamodb.tables.groups:ScamShield-FamilyGroups-dev}") String tableName) {
        this.table = enhancedClient.table(tableName, TableSchema.fromBean(FamilyGroupEntity.class));
        log.info("Initialized DynamoDbFamilyGroupRepository for table: {}", tableName);
    }

    @Override
    public FamilyGroupEntity save(FamilyGroupEntity group) {
        if (group == null || group.getGroupId() == null) {
            throw new IllegalArgumentException("FamilyGroup and groupId must not be null");
        }
        fallbackStore.put(group.getGroupId(), group);
        try {
            table.putItem(group);
            log.debug("Persisted FamilyGroup: {}", group.getGroupId());
        } catch (Exception e) {
            log.debug("DynamoDB put FamilyGroup failed ({}), retained in fallback store", e.getMessage());
        }
        return group;
    }

    @Override
    public Optional<FamilyGroupEntity> findById(String groupId) {
        if (groupId == null || groupId.trim().isEmpty()) return Optional.empty();
        try {
            FamilyGroupEntity item = table.getItem(Key.builder().partitionValue(groupId).build());
            if (item != null) return Optional.of(item);
        } catch (Exception e) {
            log.debug("DynamoDB get FamilyGroup failed ({})", e.getMessage());
        }
        return Optional.ofNullable(fallbackStore.get(groupId));
    }

    @Override
    public Optional<FamilyGroupEntity> findByOwnerId(String ownerId) {
        if (ownerId == null) return Optional.empty();
        return fallbackStore.values().stream()
                .filter(g -> ownerId.equals(g.getOwnerId()))
                .findFirst();
    }

    @Override
    public Optional<FamilyGroupEntity> findByUserId(String userId) {
        if (userId == null) return Optional.empty();
        return fallbackStore.values().stream()
                .filter(g -> {
                    if (userId.equals(g.getOwnerId())) return true;
                    String membersJson = g.getMembersJson();
                    return membersJson != null && membersJson.contains(userId);
                })
                .findFirst();
    }

    @Override
    public void deleteById(String groupId) {
        if (groupId == null) return;
        fallbackStore.remove(groupId);
        try {
            table.deleteItem(Key.builder().partitionValue(groupId).build());
        } catch (Exception e) {
            log.debug("DynamoDB delete FamilyGroup failed ({})", e.getMessage());
        }
    }

    @Override
    public void clearAll() {
        fallbackStore.clear();
    }
}
