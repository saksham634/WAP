package com.wap.controller;

import com.wap.dto.ApiResponse;
import com.wap.dto.DirectMessageDTO;
import com.wap.dto.SendMessageRequest;
import com.wap.service.DirectMessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@Tag(name = "Direct Messaging", description = "Endpoints for inter-role communication, notifications, and inbox/sent messages")
public class DirectMessageController {

    private final DirectMessageService messageService;

    public DirectMessageController(DirectMessageService messageService) {
        this.messageService = messageService;
    }

    @Operation(summary = "Send a direct message to a user or role group")
    @PostMapping
    public ResponseEntity<DirectMessageDTO> sendMessage(@Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(messageService.sendMessage(request));
    }

    @Operation(summary = "Get received inbox messages for authenticated user")
    @GetMapping("/inbox")
    public ResponseEntity<List<DirectMessageDTO>> getInboxMessages() {
        return ResponseEntity.ok(messageService.getInboxMessages());
    }

    @Operation(summary = "Get sent messages for authenticated user")
    @GetMapping("/sent")
    public ResponseEntity<List<DirectMessageDTO>> getSentMessages() {
        return ResponseEntity.ok(messageService.getSentMessages());
    }

    @Operation(summary = "Mark a message as read")
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        messageService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Message marked as read", Map.of("message", "Message marked as read")));
    }

    @Operation(summary = "Delete a message by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        messageService.deleteMessage(id);
        return ResponseEntity.ok(ApiResponse.success("Message deleted successfully", Map.of("message", "Message deleted successfully")));
    }
}
