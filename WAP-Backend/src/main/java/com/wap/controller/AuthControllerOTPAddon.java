package com.wap.controller;

import com.wap.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthControllerOTPAddon {

    @Autowired
    private OtpService otpService;

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
}