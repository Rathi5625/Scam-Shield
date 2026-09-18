package com.scamshield.config;

import com.nimbusds.jwt.SignedJWT;
import com.scamshield.service.ratelimit.RateLimitService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter enforcing rate limits on critical endpoints:
 * - AI scanner endpoints (/api/scan/...)
 * - Family invitations (/api/family/invite)
 * - Emergency lockdown endpoints (/api/family/group/{groupId}/lockdown)
 */
@Component
@Order(-50)
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;

    public RateLimitFilter(RateLimitService rateLimitService) {
        this.rateLimitService = rateLimitService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Only rate-limit modifying or expensive POST/PUT actions
        if (!"POST".equalsIgnoreCase(method) && !"PUT".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        String category = resolveCategory(path);
        if (category == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientKey = resolveClientKey(request);

        boolean allowed = rateLimitService.tryAcquire(clientKey, category);
        if (!allowed) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.setHeader("Retry-After", "60");
            response.getWriter().write("""
                {"error":"RATE_LIMIT_EXCEEDED","message":"Rate limit exceeded. Please slow down and try again in 60 seconds.","retryAfterSeconds":60}
            """);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String resolveCategory(String path) {
        if (path.startsWith("/api/scan/")) {
            return "SCAN";
        }
        if (path.startsWith("/api/family/invite") || path.contains("/lockdown")) {
            return "FAMILY";
        }
        return null;
    }

    private String resolveClientKey(HttpServletRequest request) {
        // 1. Authenticated Principal from Spring SecurityContext
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt && jwt.getSubject() != null) {
            return jwt.getSubject();
        }

        // 2. Early Bearer token subject extraction if filter executes before SecurityContext setup
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7).trim();
                SignedJWT signedJWT = SignedJWT.parse(token);
                String sub = signedJWT.getJWTClaimsSet().getSubject();
                if (sub != null && !sub.isBlank()) {
                    return sub;
                }
            } catch (Exception ignored) {}
        }

        // 3. Fallback to client IP
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown-client";
    }
}
