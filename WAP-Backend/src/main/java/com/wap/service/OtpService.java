package com.wap.service;

import com.wap.util.EmailValidatorUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    @Autowired
    private JavaMailSender mailSender;

    // Stores email -> OTP mapping (In production, use Redis with TTL)
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

    public String generateAndSendOtp(String email) {
        if (!EmailValidatorUtil.isPublicDomain(email)) {
            throw new IllegalArgumentException("Only valid public email providers (Gmail, Outlook, iCloud, Yahoo) are allowed.");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(email, otp);

        // Send Email
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Your Workforce Analytics Platform Verification Code");
            message.setText("Your OTP code is: " + otp + ". It is valid for 5 minutes.");
            mailSender.send(message);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(OtpService.class)
                    .warn("SMTP mail delivery failed. Verification OTP code for {}: {} (Reason: {})", email, otp, e.getMessage());
        }

        return "OTP sent successfully to " + email;
    }

    public boolean verifyOtp(String email, String otp) {
        String storedOtp = otpStorage.get(email);
        if (storedOtp != null && storedOtp.equals(otp)) {
            otpStorage.remove(email); // Remove after successful verification
            return true;
        }
        return false;
    }
}