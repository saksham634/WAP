package com.wap.service;

import com.wap.dto.ChatRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ChatbotService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${groq.api.key:}")
    private String apiKey;

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String apiUrl;

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String model;

    public String getReply(ChatRequest chatRequest, String userRole, String userName) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return "The AI Assistant is currently unconfigured. Please set the GROQ_API_KEY environment variable to enable live assistance.";
        }

        List<Map<String, String>> messages = new ArrayList<>();

        // System prompt — this is what makes it feel purpose-built, not generic
        String systemPrompt = """
            You are the WAP Assistant, a helpful in-app assistant for the Workforce
            Automation Portal (WAP) — a workforce management platform with attendance
            tracking, leave requests, payroll, and project management.
            The current user is logged in as: %s (name: %s).
            Answer clearly and concisely. If asked about something outside general
            workplace/HR/software topics, politely redirect to what you can help with.
            """.formatted(userRole, userName);

        messages.add(Map.of("role", "system", "content", systemPrompt));

        if (chatRequest.getHistory() != null) {
            for (ChatRequest.ChatMessageDTO m : chatRequest.getHistory()) {
                messages.add(Map.of("role", m.getRole(), "content", m.getContent()));
            }
        }

        messages.add(Map.of("role", "user", "content", chatRequest.getMessage()));

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", messages,
                "temperature", 0.7,
                "max_tokens", 500
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            // Never leak internals to the user; log server-side instead
            return "Sorry, I'm having trouble responding right now. Please try again in a moment.";
        }
    }
}