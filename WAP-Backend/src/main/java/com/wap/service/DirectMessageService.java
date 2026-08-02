package com.wap.service;

import com.wap.dto.DirectMessageDTO;
import com.wap.dto.SendMessageRequest;
import com.wap.entity.DirectMessage;
import com.wap.entity.Organization;
import com.wap.entity.User;
import com.wap.repository.DirectMessageRepository;
import com.wap.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DirectMessageService {

    private final DirectMessageRepository messageRepository;
    private final UserRepository userRepository;

    public DirectMessageService(DirectMessageRepository messageRepository, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user context not found."));
    }

    public DirectMessageDTO sendMessage(SendMessageRequest request) {
        User sender = getAuthenticatedUser();

        DirectMessage msg = new DirectMessage();
        msg.setSender(sender);
        msg.setRecipientRole(request.getRecipientRole() != null ? request.getRecipientRole() : "ROLE_HR");
        msg.setRecipientEmail(request.getRecipientEmail());
        msg.setSubject(request.getSubject());
        msg.setContent(request.getContent());
        msg.setCategory(request.getCategory() != null ? request.getCategory() : "REQUEST");
        msg.setOrganization(sender.getOrganization());
        msg.setRead(false);

        messageRepository.save(msg);
        return mapToDTO(msg);
    }

    public List<DirectMessageDTO> getInboxMessages() {
        User user = getAuthenticatedUser();
        Long orgId = user.getOrganization().getId();
        String role = user.getRole().getRoleName();
        String userEmail = user.getEmail();

        List<DirectMessage> allOrgMessages = messageRepository.findByOrganization_IdOrderByCreatedAtDesc(orgId);

        // Automatically purge any legacy premade/mock messages from DB
        List<DirectMessage> legacyMocks = allOrgMessages.stream()
                .filter(m -> (m.getSubject() != null && (
                        m.getSubject().contains("Policy Clarification") ||
                        m.getSubject().contains("System Access & Permissions") ||
                        m.getSubject().contains("Welcome to Workforce")
                )) || (m.getContent() != null && (
                        m.getContent().contains("leave balance rollover") ||
                        m.getContent().contains("Project Analytics dashboard")
                )))
                .collect(Collectors.toList());

        if (!legacyMocks.isEmpty()) {
            messageRepository.deleteAll(legacyMocks);
            allOrgMessages.removeAll(legacyMocks);
        }

        return allOrgMessages.stream()
                .filter(m -> {
                    if (m.getSender().getId().equals(user.getId())) return true;
                    if (m.getRecipientRole().equals("ALL")) return true;
                    if (m.getRecipientRole().equals(role)) return true;
                    if ("SPECIFIC_USER".equals(m.getRecipientRole()) && userEmail.equalsIgnoreCase(m.getRecipientEmail())) return true;
                    return false;
                })
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<DirectMessageDTO> getSentMessages() {
        User user = getAuthenticatedUser();
        List<DirectMessage> sent = messageRepository.findBySender_IdOrderByCreatedAtDesc(user.getId());
        return sent.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public void markAsRead(Long id) {
        User user = getAuthenticatedUser();
        DirectMessage msg = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        if (msg.getOrganization().getId().equals(user.getOrganization().getId())) {
            msg.setRead(true);
            messageRepository.save(msg);
        }
    }

    public void deleteMessage(Long id) {
        User user = getAuthenticatedUser();
        DirectMessage msg = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        if (msg.getOrganization().getId().equals(user.getOrganization().getId())) {
            messageRepository.delete(msg);
        }
    }

    private DirectMessageDTO mapToDTO(DirectMessage msg) {
        return new DirectMessageDTO(
                msg.getId(),
                msg.getSender().getFullName(),
                msg.getSender().getEmail(),
                msg.getSender().getRole().getRoleName(),
                msg.getRecipientRole(),
                msg.getRecipientEmail(),
                msg.getSubject(),
                msg.getContent(),
                msg.getCategory(),
                msg.isRead(),
                msg.getCreatedAt()
        );
    }
}
