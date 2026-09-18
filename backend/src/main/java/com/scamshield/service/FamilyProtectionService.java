package com.scamshield.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scamshield.dto.FamilyDtos.*;
import com.scamshield.model.FamilyGroupEntity;
import com.scamshield.model.FamilyInviteEntity;
import com.scamshield.model.ScanHistoryEntity;
import com.scamshield.repository.FamilyGroupRepository;
import com.scamshield.repository.FamilyInviteRepository;
import com.scamshield.repository.ScanHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FamilyProtectionService {

    private static final Logger log = LoggerFactory.getLogger(FamilyProtectionService.class);

    private final FamilyGroupRepository familyGroupRepository;
    private final FamilyInviteRepository familyInviteRepository;
    private final ScanHistoryRepository scanHistoryRepository;
    private final ScanHistoryService scanHistoryService;
    private final ObjectMapper objectMapper;
    private com.scamshield.service.notification.NotificationService notificationService;

    public FamilyProtectionService(
            FamilyGroupRepository familyGroupRepository,
            FamilyInviteRepository familyInviteRepository,
            ScanHistoryRepository scanHistoryRepository,
            ScanHistoryService scanHistoryService,
            ObjectMapper objectMapper) {
        this.familyGroupRepository = familyGroupRepository;
        this.familyInviteRepository = familyInviteRepository;
        this.scanHistoryRepository = scanHistoryRepository;
        this.scanHistoryService = scanHistoryService;
        this.objectMapper = objectMapper;
    }

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    public void setNotificationService(com.scamshield.service.notification.NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public FamilyGroupResponse createGroup(CreateFamilyGroupRequest req) {
        if (req.getOwnerId() == null || req.getGroupName() == null || req.getGroupName().trim().isEmpty()) {
            throw new IllegalArgumentException("ownerId and groupName are required");
        }

        String groupId = "fg_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        FamilyGroupEntity entity = new FamilyGroupEntity();
        entity.setGroupId(groupId);
        entity.setOwnerId(req.getOwnerId());
        entity.setGroupName(req.getGroupName().trim());
        entity.setCreatedAt(Instant.now().toString());
        entity.setEmergencyLockdownActive(false);

        // Initial Owner member
        FamilyMemberDto ownerMember = new FamilyMemberDto();
        ownerMember.setId("mem_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        ownerMember.setUserId(req.getOwnerId());
        ownerMember.setDisplayName(req.getOwnerName() != null ? req.getOwnerName() : "Guardian Operative");
        ownerMember.setEmail(req.getOwnerEmail() != null ? req.getOwnerEmail() : req.getOwnerId() + "@scamshield.internal");
        ownerMember.setRole("OWNER");
        ownerMember.setStatus("ACTIVE");
        ownerMember.setJoinedAt(Instant.now().toString());
        ownerMember.setRelationship("Self (Guardian)");
        ownerMember.setDeviceInfo("Primary Device");
        ownerMember.setDefenseState("ALL CLEAR");
        ownerMember.setActiveThreatsCount(0);

        List<FamilyMemberDto> members = new ArrayList<>();
        members.add(ownerMember);

        Map<String, Object> settings = new HashMap<>();
        settings.put("aggressivePhishing", true);
        settings.put("realTimeHeuristics", true);
        settings.put("familyAlerts", true);
        settings.put("ephemeralLogging", true);
        settings.put("emergencyLockdown", false);
        settings.put("instantSmsAlerts", true);
        settings.put("silentQuarantine", true);

        try {
            entity.setMembersJson(objectMapper.writeValueAsString(members));
            entity.setProtectionSettingsJson(objectMapper.writeValueAsString(settings));
        } catch (Exception e) {
            log.error("Failed to serialize group members/settings: {}", e.getMessage());
        }

        FamilyGroupEntity saved = familyGroupRepository.save(entity);
        log.info("Created family group {} with owner {}", saved.getGroupId(), saved.getOwnerId());
        return toGroupResponse(saved);
    }

    public Optional<FamilyGroupResponse> getGroupByUserId(String userId) {
        if (userId == null) return Optional.empty();
        return familyGroupRepository.findByUserId(userId).map(this::toGroupResponse);
    }

    public Optional<FamilyGroupResponse> getGroupById(String groupId) {
        if (groupId == null) return Optional.empty();
        return familyGroupRepository.findById(groupId).map(this::toGroupResponse);
    }

    public FamilyInviteResponse inviteMember(InviteMemberRequest req) {
        if (req.getGroupId() == null || req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("groupId and email are required for invitation");
        }

        FamilyGroupEntity group = familyGroupRepository.findById(req.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Family group not found: " + req.getGroupId()));

        // Check if member already in group
        List<FamilyMemberDto> members = parseMembers(group.getMembersJson());
        if (members.stream().anyMatch(m -> req.getEmail().trim().equalsIgnoreCase(m.getEmail()))) {
            throw new IllegalArgumentException("User with email " + req.getEmail() + " is already a family member.");
        }

        // Check if existing pending invite
        List<FamilyInviteEntity> existing = familyInviteRepository.findByGroupId(req.getGroupId());
        if (existing.stream().anyMatch(inv -> "PENDING".equals(inv.getStatus()) && req.getEmail().trim().equalsIgnoreCase(inv.getInvitedEmail()))) {
            throw new IllegalArgumentException("An active invitation already exists for " + req.getEmail());
        }

        FamilyInviteEntity invite = new FamilyInviteEntity();
        invite.setInviteId("inv_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10));
        invite.setGroupId(req.getGroupId());
        invite.setInvitedBy(req.getInvitedBy() != null ? req.getInvitedBy() : group.getOwnerId());
        invite.setInvitedEmail(req.getEmail().trim().toLowerCase());
        invite.setRelationship(req.getRelationship() != null ? req.getRelationship() : "Family Member");
        invite.setStatus("PENDING");
        invite.setCreatedAt(Instant.now().toString());
        invite.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS).toString());

        FamilyInviteEntity saved = familyInviteRepository.save(invite);
        return toInviteResponse(saved);
    }

    public List<FamilyInviteResponse> listInvites(String groupId) {
        return familyInviteRepository.findByGroupId(groupId).stream()
                .filter(inv -> "PENDING".equals(inv.getStatus()))
                .map(this::toInviteResponse)
                .collect(Collectors.toList());
    }

    public FamilyMemberDto acceptInvite(String inviteId, AcceptInviteRequest req) {
        FamilyInviteEntity invite = familyInviteRepository.findById(inviteId)
                .orElseThrow(() -> new IllegalArgumentException("Invite not found: " + inviteId));

        if (!"PENDING".equals(invite.getStatus())) {
            throw new IllegalArgumentException("Invite is not pending (status: " + invite.getStatus() + ")");
        }

        FamilyGroupEntity group = familyGroupRepository.findById(invite.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Associated family group not found: " + invite.getGroupId()));

        List<FamilyMemberDto> members = parseMembers(group.getMembersJson());

        FamilyMemberDto newMember = new FamilyMemberDto();
        newMember.setId("mem_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        newMember.setUserId(req.getMemberUserId() != null ? req.getMemberUserId() : "usr_" + UUID.randomUUID().toString().substring(0, 8));
        newMember.setDisplayName(req.getMemberDisplayName() != null ? req.getMemberDisplayName() : "Ward Member");
        newMember.setEmail(invite.getInvitedEmail());
        newMember.setRole("MEMBER");
        newMember.setStatus("ACTIVE");
        newMember.setJoinedAt(Instant.now().toString());
        newMember.setRelationship(invite.getRelationship());
        newMember.setDeviceInfo("Mobile Terminal");
        newMember.setDefenseState("PROTECTED");
        newMember.setActiveThreatsCount(0);

        members.add(newMember);

        try {
            group.setMembersJson(objectMapper.writeValueAsString(members));
            familyGroupRepository.save(group);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update group members: " + e.getMessage(), e);
        }

        invite.setStatus("ACCEPTED");
        familyInviteRepository.save(invite);

        return newMember;
    }

    public void declineInvite(String inviteId) {
        FamilyInviteEntity invite = familyInviteRepository.findById(inviteId)
                .orElseThrow(() -> new IllegalArgumentException("Invite not found: " + inviteId));
        invite.setStatus("DECLINED");
        familyInviteRepository.save(invite);
    }

    public boolean removeMember(String groupId, String memberId, String requesterUserId) {
        FamilyGroupEntity group = familyGroupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Family group not found: " + groupId));

        List<FamilyMemberDto> members = parseMembers(group.getMembersJson());
        FamilyMemberDto target = members.stream().filter(m -> memberId.equals(m.getId())).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Member not found in group"));

        // Guardian/Owner protection: cannot remove self
        if ("OWNER".equals(target.getRole()) || group.getOwnerId().equals(target.getUserId())) {
            throw new IllegalArgumentException("Guardian owner cannot remove themselves from the defense group.");
        }

        members.removeIf(m -> memberId.equals(m.getId()));

        try {
            group.setMembersJson(objectMapper.writeValueAsString(members));
            familyGroupRepository.save(group);
            return true;
        } catch (Exception e) {
            log.error("Failed to remove member: {}", e.getMessage());
            return false;
        }
    }

    public boolean updateMemberRole(String groupId, String memberId, String newRole, String requesterUserId) {
        FamilyGroupEntity group = familyGroupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Family group not found: " + groupId));

        List<FamilyMemberDto> members = parseMembers(group.getMembersJson());
        FamilyMemberDto target = members.stream().filter(m -> memberId.equals(m.getId())).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Member not found in group"));

        if ("OWNER".equals(target.getRole()) && !"OWNER".equals(newRole)) {
            throw new IllegalArgumentException("Cannot demote primary group owner");
        }

        target.setRole(newRole);

        try {
            group.setMembersJson(objectMapper.writeValueAsString(members));
            familyGroupRepository.save(group);
            return true;
        } catch (Exception e) {
            log.error("Failed to update member role: {}", e.getMessage());
            return false;
        }
    }

    public FamilyGroupResponse toggleLockdown(String groupId, boolean active) {
        FamilyGroupEntity group = familyGroupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Family group not found: " + groupId));

        group.setEmergencyLockdownActive(active);
        group.setEmergencyLockdownActivatedAt(active ? Instant.now().toString() : null);

        Map<String, Object> settings = parseSettings(group.getProtectionSettingsJson());
        settings.put("emergencyLockdown", active);

        try {
            group.setProtectionSettingsJson(objectMapper.writeValueAsString(settings));
        } catch (Exception ignored) {
        }

        FamilyGroupEntity saved = familyGroupRepository.save(group);
        log.info("Toggled emergency lockdown for group {}: {}", groupId, active);

        if (notificationService != null) {
            try {
                notificationService.sendLockdownAlert(new com.scamshield.service.notification.NotificationService.LockdownAlertEvent(
                        "lockdown_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10),
                        groupId,
                        group.getOwnerId(),
                        active,
                        Instant.now().toString()
                ));
            } catch (Exception e) {
                log.warn("Failed to dispatch lockdown alert notification for group {}: {}", groupId, e.getMessage());
            }
        }

        return toGroupResponse(saved);
    }

    public ThreatShareResponse shareThreat(ShareThreatRequest req) {
        if (req.getFamilyGroupId() == null) {
            throw new IllegalArgumentException("familyGroupId is required to share threat");
        }

        ScanHistoryEntity entity = new ScanHistoryEntity();
        entity.setUserId(req.getSharedBy() != null ? req.getSharedBy() : "Sentinel Guardian");
        entity.setScanId("thr_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10));
        entity.setScanType(req.getScanType() != null ? req.getScanType() : "TEXT");
        entity.setGroupId(req.getFamilyGroupId());
        entity.setSharedBy(req.getSharedBy() != null ? req.getSharedBy() : "Guardian Operative");
        entity.setRiskLevel(req.getRiskLevel() != null ? req.getRiskLevel() : "HIGH");
        entity.setRiskScore(req.getRiskScore() != null ? req.getRiskScore() : 85);
        entity.setCategory(req.getCategory() != null ? req.getCategory() : "PHISHING_ATTEMPT");

        // Sanitized summary strictly redacting PII
        String sanitized = scanHistoryService.sanitizeInputSummary(req.getSummary());
        entity.setInputSummary(sanitized);
        entity.setAction("Threat intercepted and broadcast to family ward.");
        entity.setCreatedAt(Instant.now().toString());

        ScanHistoryEntity saved = scanHistoryRepository.save(entity);

        ThreatShareResponse res = new ThreatShareResponse();
        res.setId(saved.getScanId());
        res.setFamilyGroupId(saved.getGroupId());
        res.setSharedBy(saved.getSharedBy());
        res.setScanType(saved.getScanType());
        res.setRiskLevel(saved.getRiskLevel());
        res.setRiskScore(saved.getRiskScore());
        res.setCategory(saved.getCategory());
        res.setSummary(saved.getInputSummary());
        res.setVector(req.getVector() != null ? req.getVector() : "SMS Intercept");
        res.setExposureStatus(req.getExposureStatus() != null ? req.getExposureStatus() : "Zero Exposure");
        res.setCreatedAt(saved.getCreatedAt());
        return res;
    }

    public List<ThreatShareResponse> getFeed(String groupId, int limit) {
        if (groupId == null) return List.of();
        int effectiveLimit = limit > 0 ? limit : 20;
        return scanHistoryRepository.findByGroupId(groupId, effectiveLimit).stream()
                .map(s -> {
                    ThreatShareResponse r = new ThreatShareResponse();
                    r.setId(s.getScanId());
                    r.setFamilyGroupId(s.getGroupId());
                    r.setSharedBy(s.getSharedBy() != null ? s.getSharedBy() : "Ward Member");
                    r.setScanType(s.getScanType());
                    r.setRiskLevel(s.getRiskLevel());
                    r.setRiskScore(s.getRiskScore());
                    r.setCategory(s.getCategory());
                    r.setSummary(s.getInputSummary());
                    r.setVector("Network Gate");
                    r.setExposureStatus("Defended");
                    r.setCreatedAt(s.getCreatedAt());
                    return r;
                })
                .collect(Collectors.toList());
    }

    private List<FamilyMemberDto> parseMembers(String json) {
        if (json == null || json.trim().isEmpty()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<FamilyMemberDto>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private Map<String, Object> parseSettings(String json) {
        if (json == null || json.trim().isEmpty()) return new HashMap<>();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private FamilyGroupResponse toGroupResponse(FamilyGroupEntity entity) {
        FamilyGroupResponse res = new FamilyGroupResponse();
        res.setGroupId(entity.getGroupId());
        res.setOwnerId(entity.getOwnerId());
        res.setGroupName(entity.getGroupName());
        res.setMembers(parseMembers(entity.getMembersJson()));
        res.setEmergencyLockdownActive(Boolean.TRUE.equals(entity.getEmergencyLockdownActive()));
        res.setEmergencyLockdownActivatedAt(entity.getEmergencyLockdownActivatedAt());
        res.setProtectionSettings(parseSettings(entity.getProtectionSettingsJson()));
        res.setCreatedAt(entity.getCreatedAt());
        return res;
    }

    private FamilyInviteResponse toInviteResponse(FamilyInviteEntity entity) {
        FamilyInviteResponse res = new FamilyInviteResponse();
        res.setInviteId(entity.getInviteId());
        res.setGroupId(entity.getGroupId());
        res.setInvitedBy(entity.getInvitedBy());
        res.setInvitedEmail(entity.getInvitedEmail());
        res.setRelationship(entity.getRelationship());
        res.setStatus(entity.getStatus());
        res.setCreatedAt(entity.getCreatedAt());
        res.setExpiresAt(entity.getExpiresAt());
        return res;
    }
}
