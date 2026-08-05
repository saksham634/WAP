package com.wap.controller;

import com.wap.dto.ChatRequest;
import com.wap.dto.ChatResponse;
import com.wap.service.ChatbotService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping
    public ChatResponse chat(@Valid @RequestBody ChatRequest request, Authentication authentication) {
        String role = authentication.getAuthorities().stream()
                .findFirst().map(GrantedAuthority::getAuthority).orElse("USER");
        String username = authentication.getName();

        String reply = chatbotService.getReply(request, role, username);
        return new ChatResponse(reply);
    }
}