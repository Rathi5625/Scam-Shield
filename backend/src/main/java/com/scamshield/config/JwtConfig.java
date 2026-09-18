package com.scamshield.config;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jwt.SignedJWT;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.*;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Configuration
public class JwtConfig {

    private static final Logger log = LoggerFactory.getLogger(JwtConfig.class);

    @Value("${aws.cognito.jwk-set-uri:https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_ScamShieldDev/.well-known/jwks.json}")
    private String jwkSetUri;

    @Value("${aws.cognito.issuer-uri:https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_ScamShieldDev}")
    private String issuerUri;

    @Value("${aws.cognito.test-jwt-secret:scamshield-dev-jwt-secret-key-must-be-32-chars!}")
    private String testJwtSecret;

    @Bean
    public JwtDecoder jwtDecoder() {
        log.info("Initializing ScamShield JwtDecoder. JWKS URI: {}, Issuer: {}", jwkSetUri, issuerUri);

        OAuth2TokenValidator<Jwt> timestampValidator = new JwtTimestampValidator();
        OAuth2TokenValidator<Jwt> subjectValidator = token -> {
            if (token.getSubject() == null || token.getSubject().trim().isEmpty()) {
                OAuth2Error error =
                        new OAuth2Error("invalid_token", "JWT subject claim ('sub') cannot be null or empty", null);
                return OAuth2TokenValidatorResult.failure(error);
            }
            return OAuth2TokenValidatorResult.success();
        };

        DelegatingOAuth2TokenValidator<Jwt> localDevValidator =
                new DelegatingOAuth2TokenValidator<>(timestampValidator, subjectValidator);

        // 1. Production Cognito RSA Decoder (configured with Cognito JWKS)
        NimbusJwtDecoder cognitoDecoder;
        try {
            cognitoDecoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
            OAuth2TokenValidator<Jwt> issuerValidator = new JwtIssuerValidator(issuerUri);
            cognitoDecoder.setJwtValidator(new org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator<>(
                    timestampValidator, subjectValidator, issuerValidator
            ));
        } catch (Exception e) {
            log.warn("Could not pre-initialize Cognito JWKS decoder: {}. Fallback will be used if needed.", e.getMessage());
            cognitoDecoder = null;
        }

        // 2. Test/Local HMAC Decoder for deterministic offline testing & development
        byte[] secretBytes = testJwtSecret.getBytes(StandardCharsets.UTF_8);
        SecretKey hmacKey = new SecretKeySpec(secretBytes, "HmacSHA256");
        NimbusJwtDecoder testSecretDecoder = NimbusJwtDecoder.withSecretKey(hmacKey).build();
        testSecretDecoder.setJwtValidator(localDevValidator);

        final NimbusJwtDecoder finalCognitoDecoder = cognitoDecoder;

        return token -> {
            if (token == null || token.trim().isEmpty()) {
                throw new BadJwtException("Token cannot be null or empty");
            }

            try {
                SignedJWT signedJWT = SignedJWT.parse(token);
                JWSAlgorithm algorithm = signedJWT.getHeader().getAlgorithm();

                if (JWSAlgorithm.HS256.equals(algorithm) || JWSAlgorithm.HS384.equals(algorithm) || JWSAlgorithm.HS512.equals(algorithm)) {
                    // Test / Local dev token signed with HMAC
                    return testSecretDecoder.decode(token);
                } else if (JWSAlgorithm.RS256.equals(algorithm) || JWSAlgorithm.RS384.equals(algorithm) || JWSAlgorithm.RS512.equals(algorithm)) {
                    // Real Amazon Cognito token signed with RS256
                    if (finalCognitoDecoder != null) {
                        return finalCognitoDecoder.decode(token);
                    } else {
                        // Attempt lazy creation if not pre-initialized
                        NimbusJwtDecoder lazyCognitoDecoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
                        return lazyCognitoDecoder.decode(token);
                    }
                } else {
                    throw new BadJwtException("Unsupported JWT algorithm: " + algorithm.getName());
                }
            } catch (JwtException e) {
                // Pass through standard Spring Security JwtExceptions (e.g. JwtValidationException for expired tokens)
                throw e;
            } catch (Exception e) {
                log.debug("JWT parsing/verification error: {}", e.getMessage());
                throw new BadJwtException("Invalid or malformed JWT token: " + e.getMessage(), e);
            }
        };
    }
}
