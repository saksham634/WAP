package com.wap.dto;

public class AttendanceStatusResponse {
    private String status; // "NOT_CHECKED_IN", "CHECKED_IN", "CHECKED_OUT"
    private String checkInTime;
    private String checkOutTime;

    public AttendanceStatusResponse(String status, String checkInTime, String checkOutTime) {
        this.status = status;
        this.checkInTime = checkInTime;
        this.checkOutTime = checkOutTime;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCheckInTime() { return checkInTime; }
    public void setCheckInTime(String checkInTime) { this.checkInTime = checkInTime; }

    public String getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(String checkOutTime) { this.checkOutTime = checkOutTime; }

    public String getPunchInTime() { return checkInTime; }
    public String getPunchOutTime() { return checkOutTime; }
    public boolean isPunchedIn() { return "CHECKED_IN".equals(status); }
}