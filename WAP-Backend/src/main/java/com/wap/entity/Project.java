package com.wap.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String status; // NOT_STARTED, IN_PROGRESS, COMPLETED, ON_HOLD

    @Column(nullable = false)
    private String priority; // LOW, MEDIUM, HIGH

    private LocalDate startDate;

    private LocalDate deadline;

    private int progress; // 0 - 100

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "project_users",
        joinColumns = @JoinColumn(name = "project_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private java.util.Set<User> assignedUsers = new java.util.HashSet<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "org_id", nullable = false)
    private Organization organization;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDate createdAt;



    public Project() {}

    public Project(String title, String description, String status, String priority, LocalDate startDate, LocalDate deadline, int progress, Organization organization) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.startDate = startDate;
        this.deadline = deadline;
        this.progress = progress;
        this.organization = organization;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }

    public java.util.Set<User> getAssignedUsers() { return assignedUsers; }
    public void setAssignedUsers(java.util.Set<User> assignedUsers) { this.assignedUsers = assignedUsers; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public LocalDate getCreatedAt() { return createdAt; }
}
