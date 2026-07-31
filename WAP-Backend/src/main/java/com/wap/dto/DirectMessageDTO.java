package com.wap.dto;

import java.time.LocalDateTime;

public class DirectMessageDTO {
    private Long id;
    private String senderName;
    private String senderEmail;
    private String senderRole;
    private String recipientRole;
    private String recipientEmail;
    private String subject;
    private String content;
    private String category;
    private boolean isRead;
    private LocalDateTime createdAt;

    public DirectMessageDTO(Long id, String senderName, String senderEmail, String senderRole, String recipientRole, String recipientEmail, String subject, String content, String category, boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.senderName = senderName;
        this.senderEmail = senderEmail;
        this.senderRole = senderRole;
        this.recipientRole = recipientRole;
        this.recipientEmail = recipientEmail;
        this.subject = subject;
        this.content = content;
        this.category = category;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getSenderName() { return senderName; }
    public String getSenderEmail() { return senderEmail; }
    public String getSenderRole() { return senderRole; }
    public String getRecipientRole() { return recipientRole; }
    public String getRecipientEmail() { return recipientEmail; }
    public String getSubject() { return subject; }
    public String getContent() { return content; }
    public String getCategory() { return category; }
    public boolean isRead() { return isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
