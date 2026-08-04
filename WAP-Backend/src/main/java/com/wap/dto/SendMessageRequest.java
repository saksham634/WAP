package com.wap.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {

    private String recipientRole; // "ROLE_HR", "ROLE_ADMIN", "ROLE_EMPLOYEE", "ALL", "SPECIFIC_USER"
    private String recipientEmail;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Message content is required")
    private String content;

    private String category; // REQUEST, UPDATE, GENERAL
}
