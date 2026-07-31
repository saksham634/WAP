package com.wap.dto;

public class LeaveSummaryDTO {
    private int totalLeaves;
    private int usedLeaves;
    private int remainingLeaves;
    private int pendingLeaves;

    public LeaveSummaryDTO(int totalLeaves, int usedLeaves, int remainingLeaves, int pendingLeaves) {
        this.totalLeaves = totalLeaves;
        this.usedLeaves = usedLeaves;
        this.remainingLeaves = remainingLeaves;
        this.pendingLeaves = pendingLeaves;
    }

    public int getTotalLeaves() { return totalLeaves; }
    public int getUsedLeaves() { return usedLeaves; }
    public int getRemainingLeaves() { return remainingLeaves; }
    public int getPendingLeaves() { return pendingLeaves; }
}
