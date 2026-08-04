package com.wap.controller;

import com.wap.dto.ApiResponse;
import com.wap.dto.AuthResponse;
import com.wap.dto.LoginRequest;
import com.wap.dto.RegisterOrgRequest;
import com.wap.service.AuthService;
import com.wap.service.OtpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication & User Access", description = "Endpoints for user login, token refresh, OTP verification, password reset, and organization onboarding")
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    public AuthController(AuthService authService, OtpService otpService) {
        this.authService = authService;
        this.otpService = otpService;
    }
    
    @Operation(summary = "Get current logged-in user profile")
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Not authenticated"));
        }
        
        return ResponseEntity.ok(ApiResponse.success(authService.getUserProfile(auth.getName())));
    }

    @Operation(summary = "Send OTP to email for password recovery")
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Email address is required."));
        }
        String response = otpService.generateAndSendOtp(email);
        return ResponseEntity.ok(ApiResponse.success(response, Map.of("message", response)));
    }

    @Operation(summary = "Verify OTP code for password reset")
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Email and OTP are required."));
        }
        boolean isValid = otpService.verifyOtp(email, otp);
        if (isValid) {
            return ResponseEntity.ok(ApiResponse.success("OTP verified successfully.", Map.of("message", "OTP verified successfully.")));
        }
        return ResponseEntity.badRequest().body(ApiResponse.error(400, "Invalid or expired OTP."));
    }

    @Operation(summary = "Reset password using OTP verification")
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        if (email == null || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Valid email and new password (min 6 chars) are required."));
        }
        authService.resetPassword(email, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password updated successfully.", Map.of("message", "Password updated successfully.")));
    }

    @Operation(summary = "Authenticate user with email and password")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Refresh JWT access token using a valid rotating refresh token")
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            throw new IllegalArgumentException("Refresh token is required.");
        }
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Revoke refresh token and log out")
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody(required = false) Map<String, String> request) {
        if (request != null && request.containsKey("refreshToken")) {
            authService.logout(request.get("refreshToken"));
        }
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", Map.of("message", "Logged out successfully")));
    }

    @Operation(summary = "Register a new organization with an initial admin user")
    @PostMapping("/register-org")
    public ResponseEntity<AuthResponse> registerOrg(@Valid @RequestBody RegisterOrgRequest request) {
        AuthResponse response = authService.registerOrganization(request);
        return ResponseEntity.ok(response);
    }
}