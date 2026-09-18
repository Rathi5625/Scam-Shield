package com.scamshield.repository;

import com.scamshield.model.FamilyInviteEntity;

import java.util.List;
import java.util.Optional;

public interface FamilyInviteRepository {
    FamilyInviteEntity save(FamilyInviteEntity invite);
    Optional<FamilyInviteEntity> findById(String inviteId);
    List<FamilyInviteEntity> findByGroupId(String groupId);
    void deleteById(String inviteId);
    void clearAll();
}
