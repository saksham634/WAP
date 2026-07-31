package com.wap.entity;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@NoArgsConstructor
@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String performedBy;

    @Column(nullable = false)
    private String userEmail;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime timestamp;



    public AuditLog(String action, String performedBy, String userEmail) {
        this.action = action;
        this.performedBy = performedBy;
        this.userEmail = userEmail;
    }

    public Long getId() { return id; }
    public String getAction() { return action; }
    public String getPerformedBy() { return performedBy; }
    public String getUserEmail() { return userEmail; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
