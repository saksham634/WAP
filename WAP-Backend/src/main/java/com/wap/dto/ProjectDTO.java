package com.wap.dto;

import java.time.LocalDate;

public class ProjectDTO {
    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private LocalDate startDate;
    private LocalDate deadline;
    private int progress;
    private java.util.List<UserSummaryDTO> assignedUsers;

    public ProjectDTO(Long id, String title, String description, String status, String priority, LocalDate startDate, LocalDate deadline, int progress, java.util.List<UserSummaryDTO> assignedUsers) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.startDate = startDate;
        this.deadline = deadline;
        this.progress = progress;
        this.assignedUsers = assignedUsers;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getStatus() {
        return status;
    }

    public String getPriority() {
        return priority;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public int getProgress() {
        return progress;
    }

    public java.util.List<UserSummaryDTO> getAssignedUsers() {
        return assignedUsers;
    }
}
