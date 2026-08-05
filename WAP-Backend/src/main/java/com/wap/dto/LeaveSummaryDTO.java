package com.wap.dto;

public class LeaveSummaryDTO {
    private int casualLeaves;
    private int sickLeaves;
    private int paidLeaves;
    private int totalAvailable;
    private int totalLeaves;
    private int usedLeaves;
    private int remainingLeaves;
    private int pendingLeaves;

    public LeaveSummaryDTO() {}

    public LeaveSummaryDTO(int casualLeaves, int sickLeaves, int paidLeaves, int totalAvailable,
                           int totalLeaves, int usedLeaves, int remainingLeaves, int pendingLeaves) {
        this.casualLeaves = casualLeaves;
        this.sickLeaves = sickLeaves;
        this.paidLeaves = paidLeaves;
        this.totalAvailable = totalAvailable;
        this.totalLeaves = totalLeaves;
        this.usedLeaves = usedLeaves;
        this.remainingLeaves = remainingLeaves;
        this.pendingLeaves = pendingLeaves;
    }

    public int getCasualLeaves() { return casualLeaves; }
    public void setCasualLeaves(int casualLeaves) { this.casualLeaves = casualLeaves; }

    public int getSickLeaves() { return sickLeaves; }
    public void setSickLeaves(int sickLeaves) { this.sickLeaves = sickLeaves; }

    public int getPaidLeaves() { return paidLeaves; }
    public void setPaidLeaves(int paidLeaves) { this.paidLeaves = paidLeaves; }

    public int getTotalAvailable() { return totalAvailable; }
    public void setTotalAvailable(int totalAvailable) { this.totalAvailable = totalAvailable; }

    public int getTotalLeaves() { return totalLeaves; }
    public void setTotalLeaves(int totalLeaves) { this.totalLeaves = totalLeaves; }

    public int getUsedLeaves() { return usedLeaves; }
    public void setUsedLeaves(int usedLeaves) { this.usedLeaves = usedLeaves; }

    public int getRemainingLeaves() { return remainingLeaves; }
    public void setRemainingLeaves(int remainingLeaves) { this.remainingLeaves = remainingLeaves; }

    public int getPendingLeaves() { return pendingLeaves; }
    public void setPendingLeaves(int pendingLeaves) { this.pendingLeaves = pendingLeaves; }
}
