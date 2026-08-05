package com.wap.service;

import com.wap.entity.AuditLog;
import com.wap.entity.User;
import com.wap.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String action, String performedBy, String userEmail) {
        try {
            AuditLog auditLog = new AuditLog(
                action != null ? action : "System Event",
                performedBy != null && !performedBy.trim().isEmpty() ? performedBy : "System",
                userEmail != null && !userEmail.trim().isEmpty() ? userEmail : "system@wap.com"
            );
            auditLogRepository.saveAndFlush(auditLog);
        } catch (Exception e) {
            System.err.println("Audit log warning: " + e.getMessage());
        }
    }

    public void log(String action, User user) {
        if (user != null) {
            String name = user.getFullName() != null && !user.getFullName().trim().isEmpty() ? user.getFullName() : user.getEmail();
            log(action, name, user.getEmail());
        } else {
            log(action, "System", "system@wap.com");
        }
    }

    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }

    public List<AuditLog> getTop5Logs() {
        return auditLogRepository.findTop5ByOrderByTimestampDesc();
    }
}
