package com.wap.repository;

import com.wap.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop50ByOrganization_IdOrderByTimestampDesc(Long organizationId);
    List<AuditLog> findTop5ByOrganization_IdOrderByTimestampDesc(Long organizationId);
    List<AuditLog> findTop50ByOrderByTimestampDesc();
    List<AuditLog> findTop5ByOrderByTimestampDesc();
}

