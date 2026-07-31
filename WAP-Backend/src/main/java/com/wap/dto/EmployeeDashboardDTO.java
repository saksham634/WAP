package com.wap.dto;

public class EmployeeDashboardDTO {
    private String attendancePercentage;
    private int leavesTaken;
    private int balanceLeaves;
    private String todayStatus;

    public EmployeeDashboardDTO() {
    }

    public EmployeeDashboardDTO(String attendancePercentage, int leavesTaken, int balanceLeaves, String todayStatus) {
        this.attendancePercentage = attendancePercentage;
        this.leavesTaken = leavesTaken;
        this.balanceLeaves = balanceLeaves;
        this.todayStatus = todayStatus;
    }

    public String getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(String attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }

    public int getLeavesTaken() {
        return leavesTaken;
    }

    public void setLeavesTaken(int leavesTaken) {
        this.leavesTaken = leavesTaken;
    }

    public int getBalanceLeaves() {
        return balanceLeaves;
    }

    public void setBalanceLeaves(int balanceLeaves) {
        this.balanceLeaves = balanceLeaves;
    }

    public String getTodayStatus() {
        return todayStatus;
    }

    public void setTodayStatus(String todayStatus) {
        this.todayStatus = todayStatus;
    }
}
