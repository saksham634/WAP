package com.wap.dto;

public class ProjectTeamStatsDTO {
    private Long userId;
    private String fullName;
    private String designation;
    private String role;
    private Double baseSalary;
    private int presentDays;

    public ProjectTeamStatsDTO(Long userId, String fullName, String designation, String role, Double baseSalary, int presentDays) {
        this.userId = userId;
        this.fullName = fullName;
        this.designation = designation;
        this.role = role;
        this.baseSalary = baseSalary;
        this.presentDays = presentDays;
    }

    public Long getUserId() { return userId; }
    public String getFullName() { return fullName; }
    public String getDesignation() { return designation; }
    public String getRole() { return role; }
    public Double getBaseSalary() { return baseSalary; }
    public int getPresentDays() { return presentDays; }
}
