package com.wap.dto;

import java.time.LocalDate;

public class LeaveSubmitRequest {
    private String leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;

    // Getters and Setters
    public String getLeaveType() { return leaveType; }
    public void setLeaveType(String leaveType) { this.leaveType = leaveType; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}