package com.scamshield.repository;

import com.scamshield.model.UserEntity;

import java.util.Optional;

public interface UserRepository {
    Optional<UserEntity> findById(String userId);
    Optional<UserEntity> findByEmail(String email);
    UserEntity save(UserEntity user);
    void deleteById(String userId);
    void clearAll();
}
