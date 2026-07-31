package com.wap.dto;

public class SendMessageRequest {
    private String recipientRole; // "ROLE_HR", "ROLE_ADMIN", "ROLE_EMPLOYEE", "ALL", "SPECIFIC_USER"
    private String recipientEmail; // Optional specific user email
    private String subject;
    private String content;
    private String category; // REQUEST, UPDATE, GENERAL

    public String getRecipientRole() { return recipientRole; }
    public void setRecipientRole(String recipientRole) { this.recipientRole = recipientRole; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
