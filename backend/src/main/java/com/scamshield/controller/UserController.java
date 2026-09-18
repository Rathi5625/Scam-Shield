package com.scamshield.controller;

import com.scamshield.dto.UserDtos.UserBootstrapRequest;
import com.scamshield.dto.UserDtos.UserProfileResponse;
import com.scamshield.dto.UserDtos.UserUpdateRequest;
import com.scamshield.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Retrieves the profile of the currently authenticated operative (derived strictly from JWT sub).
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal Jwt jwt) {
        String authUserId = jwt.getSubject();
        return userService.getUser(authUserId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Bootstraps/creates a profile for the authenticated operative.
     * The backend strictly binds the profile to the verified JWT subject, ignoring any client-supplied userId.
     */
    @PostMapping("/bootstrap")
    public ResponseEntity<UserProfileResponse> bootstrapUser(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody UserBootstrapRequest request) {
        String authUserId = jwt.getSubject();
        request.setUserId(authUserId);

        // Derive email from JWT claim if not explicitly provided or if available in claims
        String emailClaim = jwt.getClaimAsString("email");
        if (emailClaim != null && !emailClaim.isBlank() && (request.getEmail() == null || request.getEmail().isBlank())) {
            request.setEmail(emailClaim);
        }

        UserProfileResponse response = userService.bootstrapUser(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves a user profile by ID.
     * Cross-user isolation: an operative can only access their own profile.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUser(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String userId) {
        String authUserId = jwt.getSubject();
        if (!authUserId.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "FORBIDDEN", "message", "Cross-user profile access denied."));
        }

        return userService.getUser(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Updates operative profile. Strictly bound to the authenticated JWT subject.
     */
    @PutMapping("/{userId}/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String userId,
            @RequestBody UserUpdateRequest request) {
        String authUserId = jwt.getSubject();
        if (!authUserId.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "FORBIDDEN", "message", "Cross-user profile modification denied."));
        }

        UserProfileResponse response = userService.updateProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Updates operative security preferences. Strictly bound to the authenticated JWT subject.
     */
    @PutMapping("/{userId}/preferences")
    public ResponseEntity<?> updatePreferences(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String userId,
            @RequestBody Map<String, Object> preferences) {
        String authUserId = jwt.getSubject();
        if (!authUserId.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "FORBIDDEN", "message", "Cross-user preference modification denied."));
        }

        UserProfileResponse response = userService.updatePreferences(userId, preferences);
        return ResponseEntity.ok(response);
    }
}
