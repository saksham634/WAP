package com.wap.dto;

import java.util.List;
import java.util.Map;

public class AdminDashboardDTO {
    private long totalEmployees;
    private long presentToday;
    private long pendingLeaves;
    private long onLeave;
    private Map<String, Long> roleDistribution;
    private Map<String, Long> weeklyAttendanceTrend;
    private List<Map<String, String>> systemAlerts;

    public AdminDashboardDTO(long totalEmployees, long presentToday, long pendingLeaves, long onLeave, 
                             Map<String, Long> roleDistribution, Map<String, Long> weeklyAttendanceTrend, 
                             List<Map<String, String>> systemAlerts) {
        this.totalEmployees = totalEmployees;
        this.presentToday = presentToday;
        this.pendingLeaves = pendingLeaves;
        this.onLeave = onLeave;
        this.roleDistribution = roleDistribution;
        this.weeklyAttendanceTrend = weeklyAttendanceTrend;
        this.systemAlerts = systemAlerts;
    }

    public long getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(long totalEmployees) { this.totalEmployees = totalEmployees; }

    public long getPresentToday() { return presentToday; }
    public void setPresentToday(long presentToday) { this.presentToday = presentToday; }

    public long getPendingLeaves() { return pendingLeaves; }
    public void setPendingLeaves(long pendingLeaves) { this.pendingLeaves = pendingLeaves; }

    public long getOnLeave() { return onLeave; }
    public void setOnLeave(long onLeave) { this.onLeave = onLeave; }

    public Map<String, Long> getRoleDistribution() { return roleDistribution; }
    public void setRoleDistribution(Map<String, Long> roleDistribution) { this.roleDistribution = roleDistribution; }

    public Map<String, Long> getWeeklyAttendanceTrend() { return weeklyAttendanceTrend; }
    public void setWeeklyAttendanceTrend(Map<String, Long> weeklyAttendanceTrend) { this.weeklyAttendanceTrend = weeklyAttendanceTrend; }

    public List<Map<String, String>> getSystemAlerts() { return systemAlerts; }
    public void setSystemAlerts(List<Map<String, String>> systemAlerts) { this.systemAlerts = systemAlerts; }
}
