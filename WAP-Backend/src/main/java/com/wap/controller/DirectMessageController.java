package com.wap.controller;

import com.wap.dto.DirectMessageDTO;
import com.wap.dto.SendMessageRequest;
import com.wap.service.DirectMessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class DirectMessageController {

    private final DirectMessageService messageService;

    public DirectMessageController(DirectMessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping
    public ResponseEntity<DirectMessageDTO> sendMessage(@RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(messageService.sendMessage(request));
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<DirectMessageDTO>> getInboxMessages() {
        return ResponseEntity.ok(messageService.getInboxMessages());
    }

    @GetMapping("/sent")
    public ResponseEntity<List<DirectMessageDTO>> getSentMessages() {
        return ResponseEntity.ok(messageService.getSentMessages());
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        messageService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        messageService.deleteMessage(id);
        return ResponseEntity.ok().build();
    }
}
