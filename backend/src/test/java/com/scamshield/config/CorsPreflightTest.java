package com.scamshield.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "cors.allowed-origins=https://scam-shield-kohl-phi.vercel.app",
    "spring.security.oauth2.resourceserver.jwt.issuer-uri=https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_test"
})
class CorsPreflightTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Preflight OPTIONS /api/health succeeds for configured Vercel production origin")
    void preflightApiHealthSucceedsForVercelOrigin() throws Exception {
        mockMvc.perform(options("/api/health")
                        .header("Origin", "https://scam-shield-kohl-phi.vercel.app")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://scam-shield-kohl-phi.vercel.app"))
                .andExpect(header().string("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,HEAD"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    @DisplayName("Preflight OPTIONS /api/health is rejected with 403 Invalid CORS request for mismatched origin (reproducing old revision behavior)")
    void preflightApiHealthRejectedForMismatchedOrigin() throws Exception {
        mockMvc.perform(options("/api/health")
                        .header("Origin", "https://d84l1y8p4kdic.cloudfront.net")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden())
                .andExpect(content().string(containsString("Invalid CORS request")));
    }

    @Test
    @DisplayName("Public GET /api/health returns 200 with Access-Control-Allow-Origin")
    void getApiHealthWithCorsHeader() throws Exception {
        mockMvc.perform(get("/api/health")
                        .header("Origin", "https://scam-shield-kohl-phi.vercel.app"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://scam-shield-kohl-phi.vercel.app"));
    }

    @Test
    @DisplayName("Preflight OPTIONS for protected endpoint succeeds before authentication")
    void preflightProtectedEndpointSucceedsBeforeAuth() throws Exception {
        mockMvc.perform(options("/api/history")
                        .header("Origin", "https://scam-shield-kohl-phi.vercel.app")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://scam-shield-kohl-phi.vercel.app"));
    }

    @Test
    @DisplayName("Protected endpoint GET /api/history still requires authentication")
    void protectedEndpointRequiresAuth() throws Exception {
        mockMvc.perform(get("/api/history")
                        .header("Origin", "https://scam-shield-kohl-phi.vercel.app"))
                .andExpect(status().isUnauthorized());
    }
}
