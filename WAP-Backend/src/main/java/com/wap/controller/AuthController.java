package com.wap.controller;

import com.wap.dto.AuthResponse;
import com.wap.dto.LoginRequest;
import com.wap.dto.RegisterOrgRequest;
import com.wap.service.AuthService;
import com.wap.service.OtpService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    public AuthController(AuthService authService, OtpService otpService) {
        this.authService = authService;
        this.otpService = otpService;
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }
        
        try {
            return ResponseEntity.ok(authService.getUserProfile(auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String response = otpService.generateAndSendOtp(email);
            return ResponseEntity.ok(Map.of("message", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        boolean isValid = otpService.verifyOtp(request.get("email"), request.get("otp"));
        if (isValid) {
            return ResponseEntity.ok(Map.of("message", "OTP verified successfully."));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String newPassword = request.get("newPassword");
            
            authService.resetPassword(email, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new AuthResponse(null, null, null, null, null, "Invalid email or password"));
        }
    }

    @PostMapping("/register-org")
    public ResponseEntity<AuthResponse> registerOrg(@RequestBody RegisterOrgRequest request) {
        try {
            AuthResponse response = authService.registerOrganization(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, null, null, null, null, e.getMessage()));
        }
    }
}