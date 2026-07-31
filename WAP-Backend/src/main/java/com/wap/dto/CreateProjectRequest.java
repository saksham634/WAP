package com.wap.dto;

import java.time.LocalDate;

public class CreateProjectRequest {
    private String title;
    private String description;
    private String priority;
    private LocalDate startDate;
    private LocalDate deadline;
    private int progress;
    private java.util.List<Long> assignedUserIds;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public int getProgress() {
        return progress;
    }

    public void setProgress(int progress) {
        this.progress = progress;
    }

    public java.util.List<Long> getAssignedUserIds() {
        return assignedUserIds;
    }

    public void setAssignedUserIds(java.util.List<Long> assignedUserIds) {
        this.assignedUserIds = assignedUserIds;
    }
}
