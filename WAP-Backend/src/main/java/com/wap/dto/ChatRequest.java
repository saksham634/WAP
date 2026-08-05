package com.wap.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class ChatRequest {

    @NotBlank
    private String message;

    // optional: previous turns for context, sent from frontend
    private List<ChatMessageDTO> history;

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public List<ChatMessageDTO> getHistory() { return history; }
    public void setHistory(List<ChatMessageDTO> history) { this.history = history; }

    public static class ChatMessageDTO {
        private String role;   // "user" or "assistant"
        private String content;
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}