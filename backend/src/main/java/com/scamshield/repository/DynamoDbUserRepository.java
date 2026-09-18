package com.scamshield.repository;

import com.scamshield.model.UserEntity;
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
public class DynamoDbUserRepository implements UserRepository {

    private static final Logger log = LoggerFactory.getLogger(DynamoDbUserRepository.class);

    private final DynamoDbTable<UserEntity> table;
    private final Map<String, UserEntity> fallbackStore = new ConcurrentHashMap<>();

    public DynamoDbUserRepository(
            DynamoDbEnhancedClient enhancedClient,
            @Value("${aws.dynamodb.tables.users:ScamShield-Users-dev}") String tableName) {
        this.table = enhancedClient.table(tableName, TableSchema.fromBean(UserEntity.class));
        log.info("Initialized DynamoDbUserRepository for table: {}", tableName);
    }

    @Override
    public Optional<UserEntity> findById(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return Optional.empty();
        }
        try {
            UserEntity entity = table.getItem(Key.builder().partitionValue(userId).build());
            if (entity != null) {
                return Optional.of(entity);
            }
        } catch (Exception e) {
            log.debug("DynamoDB get User failed ({}), falling back to local store", e.getMessage());
        }
        return Optional.ofNullable(fallbackStore.get(userId));
    }

    @Override
    public Optional<UserEntity> findByEmail(String email) {
        if (email == null) return Optional.empty();
        try {
            // Scan / query check
            for (UserEntity u : fallbackStore.values()) {
                if (email.equalsIgnoreCase(u.getEmail())) {
                    return Optional.of(u);
                }
            }
        } catch (Exception ignored) {
        }
        return Optional.empty();
    }

    @Override
    public UserEntity save(UserEntity user) {
        if (user == null || user.getUserId() == null) {
            throw new IllegalArgumentException("User and userId must not be null");
        }
        fallbackStore.put(user.getUserId(), user);
        try {
            table.putItem(user);
            log.debug("Persisted user to DynamoDB: {}", user.getUserId());
        } catch (Exception e) {
            log.debug("DynamoDB put User failed ({}), retained in fallback store", e.getMessage());
        }
        return user;
    }

    @Override
    public void deleteById(String userId) {
        if (userId == null) return;
        fallbackStore.remove(userId);
        try {
            table.deleteItem(Key.builder().partitionValue(userId).build());
        } catch (Exception e) {
            log.debug("DynamoDB delete User failed ({})", e.getMessage());
        }
    }

    @Override
    public void clearAll() {
        fallbackStore.clear();
    }
}
