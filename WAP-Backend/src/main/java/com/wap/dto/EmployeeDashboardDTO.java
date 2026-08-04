package com.wap.dto;

import java.util.Map;

public class EmployeeDashboardDTO {
    private String attendancePercentage;
    private int leavesTaken;
    private int balanceLeaves;
    private String todayStatus;
    private Map<String, Double> weeklyAttendanceTrend;
    private Map<String, Double> monthlyAttendanceTrend;

    public EmployeeDashboardDTO() {
    }

    public EmployeeDashboardDTO(String attendancePercentage, int leavesTaken, int balanceLeaves, String todayStatus,
                                Map<String, Double> weeklyAttendanceTrend, Map<String, Double> monthlyAttendanceTrend) {
        this.attendancePercentage = attendancePercentage;
        this.leavesTaken = leavesTaken;
        this.balanceLeaves = balanceLeaves;
        this.todayStatus = todayStatus;
        this.weeklyAttendanceTrend = weeklyAttendanceTrend;
        this.monthlyAttendanceTrend = monthlyAttendanceTrend;
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

    public Map<String, Double> getWeeklyAttendanceTrend() {
        return weeklyAttendanceTrend;
    }

    public void setWeeklyAttendanceTrend(Map<String, Double> weeklyAttendanceTrend) {
        this.weeklyAttendanceTrend = weeklyAttendanceTrend;
    }

    public Map<String, Double> getMonthlyAttendanceTrend() {
        return monthlyAttendanceTrend;
    }

    public void setMonthlyAttendanceTrend(Map<String, Double> monthlyAttendanceTrend) {
        this.monthlyAttendanceTrend = monthlyAttendanceTrend;
    }
}
