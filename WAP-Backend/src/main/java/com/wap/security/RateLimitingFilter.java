package com.wap.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wap.dto.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);

    @Value("${app.rate-limiting.auth.limit-per-minute:100}")
    private int maxRequestsPerMinute;

    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, RequestBucket> ipBuckets = new ConcurrentHashMap<>();

    public RateLimitingFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
    }

    private static class RequestBucket {
        long windowStartMs;
        AtomicInteger count;

        RequestBucket(long now) {
            this.windowStartMs = now;
            this.count = new AtomicInteger(1);
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();

        // Rate limit only sensitive authentication endpoints
        if (path != null && path.startsWith("/api/auth/")) {
            // Ignore pre-flight OPTIONS requests
            if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                filterChain.doFilter(request, response);
                return;
            }

            String clientIp = extractClientIp(request);
            long now = System.currentTimeMillis();

            // Periodic cleanup of stale records (if map grows large)
            if (ipBuckets.size() > 5000) {
                ipBuckets.entrySet().removeIf(entry -> now - entry.getValue().windowStartMs > 120_000);
            }

            RequestBucket bucket = ipBuckets.compute(clientIp, (key, existing) -> {
                if (existing == null || (now - existing.windowStartMs > 60_000)) {
                    return new RequestBucket(now);
                } else {
                    existing.count.incrementAndGet();
                    return existing;
                }
            });

            if (bucket.count.get() > maxRequestsPerMinute) {
                log.warn("Rate limit exceeded for IP: {} on URI: {}", clientIp, path);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setHeader("Retry-After", "60");

                ApiResponse<Object> apiResponse = ApiResponse.error(
                        HttpStatus.TOO_MANY_REQUESTS.value(),
                        "Too many authentication attempts. Rate limit exceeded. Please wait a minute before retrying."
                );

                response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || "unknown".equalsIgnoreCase(xfHeader)) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
