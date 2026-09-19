package com.scamshield.service;

import com.scamshield.dto.FamilyDtos.CreateFamilyGroupRequest;
import com.scamshield.dto.FamilyDtos.FamilyGroupResponse;
import com.scamshield.dto.FamilyDtos.InviteMemberRequest;
import com.scamshield.dto.FamilyDtos.FamilyInviteResponse;
import com.scamshield.dto.FamilyDtos.AcceptInviteRequest;
import com.scamshield.dto.UserDtos.UserBootstrapRequest;
import com.scamshield.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * Development-only fixture seeder for demo data.
 *
 * <p>FIX 8: This bean is ONLY registered when the property
 * {@code scamshield.seed-demo-data=true} is set explicitly.
 * {@code matchIfMissing=false} means the bean does NOT load when the property is absent,
 * which is the case in production (the ECS task definition does not set this env var).
 * It is therefore structurally impossible for this class to seed data in production.
 */
@Service
@ConditionalOnProperty(
        name = "scamshield.seed-demo-data",
        havingValue = "true",
        matchIfMissing = false
)
public class DataSeederService {

    private static final Logger log = LoggerFactory.getLogger(DataSeederService.class);

    private final boolean seedDemoData;
    private final UserService userService;
    private final FamilyProtectionService familyProtectionService;
    private final UserRepository userRepository;

    public DataSeederService(
            @Value("${seed.demo-data:false}") boolean seedDemoData,
            UserService userService,
            FamilyProtectionService familyProtectionService,
            UserRepository userRepository) {
        this.seedDemoData = seedDemoData;
        this.userService = userService;
        this.familyProtectionService = familyProtectionService;
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void init() {
        if (!seedDemoData) {
            log.info("ScamShield Database: SEED_DEMO_DATA=false. Running with empty/production data foundation.");
            return;
        }

        log.info("ScamShield Database: SEED_DEMO_DATA=true. Seeding development fixtures...");
        try {
            // Seed Demo Operative
            String demoUserId = "usr_demo_sentinel";
            if (userRepository.findById(demoUserId).isEmpty()) {
                UserBootstrapRequest userReq = new UserBootstrapRequest(
                        demoUserId,
                        "demo@scamshield.internal",
                        "Agent Sentinel"
                );
                userService.bootstrapUser(userReq);

                // Seed Demo Family Group
                CreateFamilyGroupRequest groupReq = new CreateFamilyGroupRequest();
                groupReq.setOwnerId(demoUserId);
                groupReq.setOwnerName("Agent Sentinel");
                groupReq.setOwnerEmail("demo@scamshield.internal");
                groupReq.setGroupName("Sentinel Family Defense Circle");
                FamilyGroupResponse group = familyProtectionService.createGroup(groupReq);

                // Seed Wards (Mom, Dad, Lucas)
                seedMember(group.getGroupId(), demoUserId, "eleanor.sentinel@gmail.internal", "Mom", "Eleanor");
                seedMember(group.getGroupId(), demoUserId, "arthur.sentinel@gmail.internal", "Dad", "Arthur");
                seedMember(group.getGroupId(), demoUserId, "lucas.sentinel@student.internal", "Brother", "Lucas");

                log.info("Successfully seeded development fixtures for group {}", group.getGroupId());
            }
        } catch (Exception e) {
            log.warn("Development fixture seeding encountered an exception: {}", e.getMessage());
        }
    }

    private void seedMember(String groupId, String ownerId, String email, String relationship, String name) {
        try {
            InviteMemberRequest invReq = new InviteMemberRequest();
            invReq.setGroupId(groupId);
            invReq.setInvitedBy(ownerId);
            invReq.setEmail(email);
            invReq.setRelationship(relationship);
            FamilyInviteResponse inv = familyProtectionService.inviteMember(invReq);

            AcceptInviteRequest accReq = new AcceptInviteRequest();
            accReq.setMemberDisplayName(name);
            familyProtectionService.acceptInvite(inv.getInviteId(), accReq);
        } catch (Exception ignored) {
        }
    }
}
