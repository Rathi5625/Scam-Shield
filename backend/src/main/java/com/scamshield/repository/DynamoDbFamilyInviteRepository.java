package com.scamshield.repository;

import com.scamshield.model.FamilyInviteEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class DynamoDbFamilyInviteRepository implements FamilyInviteRepository {

    private static final Logger log = LoggerFactory.getLogger(DynamoDbFamilyInviteRepository.class);

    private final DynamoDbTable<FamilyInviteEntity> table;
    private final Map<String, FamilyInviteEntity> fallbackStore = new ConcurrentHashMap<>();

    public DynamoDbFamilyInviteRepository(
            DynamoDbEnhancedClient enhancedClient,
            @Value("${aws.dynamodb.tables.invites:ScamShield-FamilyInvites-dev}") String tableName) {
        this.table = enhancedClient.table(tableName, TableSchema.fromBean(FamilyInviteEntity.class));
        log.info("Initialized DynamoDbFamilyInviteRepository for table: {}", tableName);
    }

    @Override
    public FamilyInviteEntity save(FamilyInviteEntity invite) {
        if (invite == null || invite.getInviteId() == null) {
            throw new IllegalArgumentException("FamilyInvite and inviteId must not be null");
        }
        fallbackStore.put(invite.getInviteId(), invite);
        try {
            table.putItem(invite);
            log.debug("Persisted FamilyInvite: {}", invite.getInviteId());
        } catch (Exception e) {
            log.debug("DynamoDB put FamilyInvite failed ({}), retained in fallback store", e.getMessage());
        }
        return invite;
    }

    @Override
    public Optional<FamilyInviteEntity> findById(String inviteId) {
        if (inviteId == null) return Optional.empty();
        try {
            FamilyInviteEntity item = table.getItem(Key.builder().partitionValue(inviteId).build());
            if (item != null) return Optional.of(item);
        } catch (Exception e) {
            log.debug("DynamoDB get FamilyInvite failed ({})", e.getMessage());
        }
        return Optional.ofNullable(fallbackStore.get(inviteId));
    }

    @Override
    public List<FamilyInviteEntity> findByGroupId(String groupId) {
        if (groupId == null) return List.of();
        return fallbackStore.values().stream()
                .filter(inv -> groupId.equals(inv.getGroupId()))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(String inviteId) {
        if (inviteId == null) return;
        fallbackStore.remove(inviteId);
        try {
            table.deleteItem(Key.builder().partitionValue(inviteId).build());
        } catch (Exception e) {
            log.debug("DynamoDB delete FamilyInvite failed ({})", e.getMessage());
        }
    }

    @Override
    public void clearAll() {
        fallbackStore.clear();
    }
}
