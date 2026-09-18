package com.scamshield.controller;

import com.scamshield.dto.FamilyDtos.*;
import com.scamshield.service.FamilyProtectionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/family")
public class FamilyController {

    private final FamilyProtectionService familyProtectionService;

    public FamilyController(FamilyProtectionService familyProtectionService) {
        this.familyProtectionService = familyProtectionService;
    }

    private boolean isMemberOrOwner(FamilyGroupResponse group, String userId) {
        if (group == null || userId == null) return false;
        if (userId.equals(group.getOwnerId())) return true;
        if (group.getMembers() != null) {
            return group.getMembers().stream().anyMatch(m -> userId.equals(m.getUserId()));
        }
        return false;
    }

    private boolean isOwner(FamilyGroupResponse group, String userId) {
        return group != null && userId != null && userId.equals(group.getOwnerId());
    }

    /**
     * Creates a new family defense group. The authenticated operative is set as the immutable owner.
     */
    @PostMapping("/group")
    public ResponseEntity<FamilyGroupResponse> createGroup(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody CreateFamilyGroupRequest request) {
        String authUserId = jwt.getSubject();
        request.setOwnerId(authUserId);
        FamilyGroupResponse response = familyProtectionService.createGroup(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves the active family group for the authenticated operative.
     * The backend derives the identity strictly from the verified JWT.
     */
    @GetMapping("/group")
    public ResponseEntity<?> getGroupByAuthenticatedUser(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String userId) {
        String authUserId = jwt.getSubject();
        return familyProtectionService.getGroupByUserId(authUserId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Retrieves a family group by groupId. Requires authenticated membership.
     */
    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getGroupById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String groupId) {
        String authUserId = jwt.getSubject();
        Optional<FamilyGroupResponse> groupOpt = familyProtectionService.getGroupById(groupId);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        FamilyGroupResponse group = groupOpt.get();
        if (!isMemberOrOwner(group, authUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "FORBIDDEN", "message", "You are not an authorized member of this family group."));
        }

        return ResponseEntity.ok(group);
    }

    /**
     * Issues an invitation to join the family group. Requires owner or member authorization.
     */
    @PostMapping("/invite")
    public ResponseEntity<?> inviteMember(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody InviteMemberRequest request) {
        String authUserId = jwt.getSubject();
        Optional<FamilyGroupResponse> groupOpt = familyProtectionService.getGroupById(request.getGroupId());
        if (groupOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "BAD_REQUEST", "message", "Family group not found."));
        }

        if (!isMemberOrOwner(groupOpt.get(), authUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "FORBIDDEN", "message", "Only family members can issue ward invites."));
        }

        request.setInvitedBy(authUserId);
        FamilyInviteResponse response = familyProtectionService.inviteMember(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Lists active invites for a group. Requires membership authorization.
     */
    @GetMapping("/invites")
    public ResponseEntity<?> listInvites(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String groupId) {
        String authUserId = jwt.getSubject();
        Optional<FamilyGroupResponse> groupOpt = familyProtectionService.getGroupById(groupId);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!isMemberOrOwner(groupOpt.get(), authUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "FORBIDDEN", "message", "Unauthorized to view family group invites."));
        }

        List<FamilyInviteResponse> response = familyProtectionService.listInvites(groupId);
        return ResponseEntity.ok(response);
    }

    /**
     * Accepts a pending invitation. Binds membership to the authenticated JWT subject.
     */
    @PostMapping("/invite/{inviteId}/accept")
    public ResponseEntity<FamilyMemberDto> acceptInvite(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String inviteId,
            @RequestBody AcceptInviteRequest request) {
        String authUserId = jwt.getSubject();
        request.setMemberUserId(authUserId);
        FamilyMemberDto response = familyProtectionService.acceptInvite(inviteId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Declines a pending invitation.
     */
    @PostMapping("/invite/{inviteId}/decline")
    public ResponseEntity<Map<String, Object>> declineInvite(@PathVariable String inviteId) {
        familyProtectionService.declineInvite(inviteId);
        return ResponseEntity.ok(Map.of("declined", true, "inviteId", inviteId));
    }

    /**
     * Removes a member from the group. Strictly requires OWNER authorization.
     */
    @DeleteMapping("/group/{groupId}/members/{memberId}")
    public ResponseEntity<?> removeMember(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String groupId,
            @PathVariable String memberId) {
        String authUserId = jwt.getSubject();
        Optional<FamilyGroupResponse> groupOpt = familyProtectionService.getGroupById(groupId);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!isOwner(groupOpt.get(), authUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "FORBIDDEN", "message", "Only the family group Guardian Owner can remove members."));
        }

        boolean removed = familyProtectionService.removeMember(groupId, memberId, authUserId);
        return ResponseEntity.ok(Map.of("removed", removed, "memberId", memberId));
    }

    /**
     * Updates a member's role. Strictly requires OWNER authorization.
     */
    @PutMapping("/group/{groupId}/members/{memberId}/role")
    public ResponseEntity<?> updateMemberRole(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String groupId,
            @PathVariable String memberId,
            @RequestBody UpdateMemberRoleRequest request) {
        String authUserId = jwt.getSubject();
        Optional<FamilyGroupResponse> groupOpt = familyProtectionService.getGroupById(groupId);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!isOwner(groupOpt.get(), authUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "FORBIDDEN", "message", "Only the family group Guardian Owner can change member roles."));
        }

        boolean updated = familyProtectionService.updateMemberRole(groupId, memberId, request.getNewRole(), authUserId);
        return ResponseEntity.ok(Map.of("updated", updated, "memberId", memberId, "role", request.getNewRole()));
    }

    /**
     * Activates emergency lockdown. Strictly requires OWNER authorization.
     */
    @PostMapping("/group/{groupId}/lockdown/activate")
    public ResponseEntity<?> activateLockdown(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String groupId) {
        String authUserId = jwt.getSubject();
        Optional<FamilyGroupResponse> groupOpt = familyProtectionService.getGroupById(groupId);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!isOwner(groupOpt.get(), authUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "FORBIDDEN", "message", "Only the family group Guardian Owner can activate emergency lockdown."));
        }

        FamilyGroupResponse response = familyProtectionService.toggleLockdown(groupId, true);
        return ResponseEntity.ok(response);
    }

    /**
     * Deactivates emergency lockdown. Strictly requires OWNER authorization.
     */
    @PostMapping("/group/{groupId}/lockdown/deactivate")
    public ResponseEntity<?> deactivateLockdown(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String groupId) {
        String authUserId = jwt.getSubject();
        Optional<FamilyGroupResponse> groupOpt = familyProtectionService.getGroupById(groupId);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!isOwner(groupOpt.get(), authUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "FORBIDDEN", "message", "Only the family group Guardian Owner can deactivate emergency lockdown."));
        }

        FamilyGroupResponse response = familyProtectionService.toggleLockdown(groupId, false);
        return ResponseEntity.ok(response);
    }

    /**
     * Shares a threat to the family feed. Requires authenticated group membership.
     */
    @PostMapping("/threats/share")
    public ResponseEntity<?> shareThreat(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ShareThreatRequest request) {
        String authUserId = jwt.getSubject();
        Optional<FamilyGroupResponse> groupOpt = familyProtectionService.getGroupById(request.getFamilyGroupId());
        if (groupOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "BAD_REQUEST", "message", "Family group not found."));
        }

        if (!isMemberOrOwner(groupOpt.get(), authUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "FORBIDDEN", "message", "Only authorized family members can broadcast threats to this circle."));
        }

        request.setSharedBy(authUserId);
        ThreatShareResponse response = familyProtectionService.shareThreat(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves the threat feed for a group. Strictly verifies membership of the authenticated operative.
     */
    @GetMapping("/feed")
    public ResponseEntity<?> getFeed(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String groupId,
            @RequestParam(required = false, defaultValue = "20") int limit) {
        String authUserId = jwt.getSubject();
        Optional<FamilyGroupResponse> groupOpt = familyProtectionService.getGroupById(groupId);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!isMemberOrOwner(groupOpt.get(), authUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "FORBIDDEN", "message", "Access denied. You are not a member of this family group threat feed."));
        }

        List<ThreatShareResponse> feed = familyProtectionService.getFeed(groupId, limit);
        return ResponseEntity.ok(feed);
    }
}
