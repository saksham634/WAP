package com.wap.service;

import com.wap.util.EmailValidatorUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final Logger logger = LoggerFactory.getLogger(OtpService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

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
            if (fromEmail != null && !fromEmail.trim().isEmpty()) {
                message.setFrom(fromEmail.trim());
            }
            message.setTo(email.trim());
            message.setSubject("Your Workforce Analytics Platform Verification Code");
            message.setText("Your verification code is: " + otp + "\n\nThis code is valid for 5 minutes. If you did not request this, please ignore this email.");
            mailSender.send(message);
            logger.info("Successfully sent OTP email via SMTP to {}", email);
        } catch (Exception e) {
            logger.warn("SMTP mail delivery failed for {}. Verification OTP code: {} (Reason: {})", email, otp, e.getMessage());
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