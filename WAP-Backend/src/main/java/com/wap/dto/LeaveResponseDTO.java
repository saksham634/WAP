package com.wap.dto;

import java.time.LocalDate;

public class LeaveResponseDTO {
    private Long id;
    private String employeeName;
    private String leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String status;

    public LeaveResponseDTO(Long id, String employeeName, String leaveType, LocalDate startDate, LocalDate endDate, String reason, String status) {
        this.id = id;
        this.employeeName = employeeName;
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.reason = reason;
        this.status = status;
    }

    // Getters
    public Long getId() { return id; }
    public String getEmployeeName() { return employeeName; }
    public String getLeaveType() { return leaveType; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public String getReason() { return reason; }
    public String getStatus() { return status; }
}