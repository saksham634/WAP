package com.wap.service;

import com.wap.entity.AuditLog;
import com.wap.entity.Organization;
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

    public void log(Organization organization, String action, String performedBy, String userEmail) {
        try {
            AuditLog auditLog = new AuditLog(
                organization,
                action != null ? action : "System Event",
                performedBy != null && !performedBy.trim().isEmpty() ? performedBy : "System",
                userEmail != null && !userEmail.trim().isEmpty() ? userEmail : "system@wap.com"
            );
            auditLogRepository.saveAndFlush(auditLog);
        } catch (Exception e) {
            System.err.println("Audit log warning: " + e.getMessage());
        }
    }

    public void log(String action, String performedBy, String userEmail) {
        log(null, action, performedBy, userEmail);
    }

    public void log(String action, User user) {
        if (user != null) {
            String name = user.getFullName() != null && !user.getFullName().trim().isEmpty() ? user.getFullName() : user.getEmail();
            log(user.getOrganization(), action, name, user.getEmail());
        } else {
            log(null, action, "System", "system@wap.com");
        }
    }

    public List<AuditLog> getRecentLogs(Long orgId) {
        if (orgId != null) {
            return auditLogRepository.findTop50ByOrganization_IdOrderByTimestampDesc(orgId);
        }
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }

    public List<AuditLog> getTop5Logs(Long orgId) {
        if (orgId != null) {
            return auditLogRepository.findTop5ByOrganization_IdOrderByTimestampDesc(orgId);
        }
        return auditLogRepository.findTop5ByOrderByTimestampDesc();
    }

    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }

    public List<AuditLog> getTop5Logs() {
        return auditLogRepository.findTop5ByOrderByTimestampDesc();
    }
}

