package com.scamshield.repository;

import com.scamshield.model.FamilyGroupEntity;

import java.util.Optional;

public interface FamilyGroupRepository {
    FamilyGroupEntity save(FamilyGroupEntity group);
    Optional<FamilyGroupEntity> findById(String groupId);
    Optional<FamilyGroupEntity> findByOwnerId(String ownerId);
    Optional<FamilyGroupEntity> findByUserId(String userId);
    void deleteById(String groupId);
    void clearAll();
}
