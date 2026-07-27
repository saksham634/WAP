package com.wap.controller;

import com.wap.dto.AuthResponse;

import com.wap.dto.LoginRequest;
import com.wap.dto.RegisterOrgRequest;
import com.wap.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allows your HTML/JS frontend to talk to this API
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
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
            return ResponseEntity.status(401).body(new AuthResponse(null, null, "Invalid email or password"));
        }
    }

    @PostMapping("/register-org")
    public ResponseEntity<AuthResponse> registerOrg(@RequestBody RegisterOrgRequest request) {
        try {
            AuthResponse response = authService.registerOrganization(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, null, e.getMessage()));
        }
    }
}