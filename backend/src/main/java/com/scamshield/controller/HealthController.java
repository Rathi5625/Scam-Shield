package com.scamshield.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @Value("${scan.mode:MOCK}")
    private String scanMode;

    @Value("${aws.region:ap-south-1}")
    private String awsRegion;

    @Value("${aws.dynamodb.tables.users:ScamShield-Users-dev}")
    private String usersTable;

    @Value("${aws.dynamodb.tables.scans:ScamShield-ScanHistory-dev}")
    private String scansTable;

    @Value("${aws.dynamodb.tables.groups:ScamShield-FamilyGroups-dev}")
    private String groupsTable;

    @Value("${aws.dynamodb.tables.invites:ScamShield-FamilyInvites-dev}")
    private String invitesTable;

    @GetMapping({"/health", "/api/health"})
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "ScamShield Backend API",
                "mode", scanMode,
                "scanMode", scanMode,
                "dataMode", "API",
                "awsRegion", awsRegion,
                "dynamodb", Map.of(
                        "status", "CONFIGURED",
                        "tables", Map.of(
                                "users", usersTable,
                                "scans", scansTable,
                                "groups", groupsTable,
                                "invites", invitesTable
                        )
                ),
                "timestamp", Instant.now().toString()
        ));
    }
}

