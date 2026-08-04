package com.wap.service;

import com.wap.dto.LeaveResponseDTO;
import com.wap.dto.LeaveSubmitRequest;
import com.wap.entity.LeaveRequest;
import com.wap.entity.User;
import com.wap.repository.LeaveRequestRepository;
import com.wap.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    private final LeaveRequestRepository leaveRepository;
    private final UserRepository userRepository;

    public LeaveService(LeaveRequestRepository leaveRepository, UserRepository userRepository) {
        this.leaveRepository = leaveRepository;
        this.userRepository = userRepository;
    }

    // Helper method to get the currently logged-in user
    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Employee: Submit a new leave request
    public void submitLeaveRequest(LeaveSubmitRequest request) {
        User user = getAuthenticatedUser();
        com.wap.util.PermissionUtil.validatePermission(user, "LEAVES");

        LeaveRequest leave = new LeaveRequest();
        leave.setUser(user);
        leave.setLeaveType(request.getLeaveType());
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setReason(request.getReason());
        leave.setStatus("PENDING");

        leaveRepository.save(leave);
    }

    // Employee: View their own leave history
    public List<LeaveResponseDTO> getMyLeaves() {
        User user = getAuthenticatedUser();
        List<LeaveRequest> requests = leaveRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());

        return requests.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // Employee: Get live leave summary KPI totals
    public com.wap.dto.LeaveSummaryDTO getLeaveSummary() {
        User user = getAuthenticatedUser();
        List<LeaveRequest> requests = leaveRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());

        int totalLeaves = 24;
        int usedLeaves = 0;
        int pendingLeaves = 0;

        for (LeaveRequest req : requests) {
            if ("APPROVED".equalsIgnoreCase(req.getStatus())) {
                usedLeaves++;
            } else if ("PENDING".equalsIgnoreCase(req.getStatus())) {
                pendingLeaves++;
            }
        }

        int remainingLeaves = Math.max(0, totalLeaves - usedLeaves);
        return new com.wap.dto.LeaveSummaryDTO(totalLeaves, usedLeaves, remainingLeaves, pendingLeaves);
    }

    // HR/Admin: View all leave submissions across organization
    public List<LeaveResponseDTO> getAllOrganizationLeaves() {
        User user = getAuthenticatedUser();
        Long orgId = user.getOrganization().getId();
        List<LeaveRequest> requests = leaveRepository.findByUser_Organization_IdOrderByCreatedAtDesc(orgId);
        return requests.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // HR/Admin: View all pending requests for their organization
    public List<LeaveResponseDTO> getPendingLeaves() {
        User user = getAuthenticatedUser();
        Long orgId = user.getOrganization().getId();
        List<LeaveRequest> requests = leaveRepository.findByUser_Organization_IdAndStatusOrderByCreatedAtDesc(orgId, "PENDING");
        return requests.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // HR/Admin: Approve or Reject a request
    @org.springframework.transaction.annotation.Transactional
    public void updateLeaveStatus(Long leaveId, String newStatus, String reason) {
        User user = getAuthenticatedUser();
        com.wap.util.PermissionUtil.validatePermission(user, "LEAVE_APPROVALS");

        LeaveRequest leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        
        // Multi-tenancy isolation: Ensure request belongs to current user's organization
        if (leave.getUser() == null || leave.getUser().getOrganization() == null ||
                !leave.getUser().getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: Leave request belongs to another organization.");
        }

        leave.setStatus(newStatus.toUpperCase());
        if ("REJECTED".equalsIgnoreCase(newStatus) && reason != null && !reason.isBlank()) {
            leave.setRejectionReason(reason);
        }
        leaveRepository.save(leave);
    }

    // Helper method to convert Entity to DTO
    private LeaveResponseDTO mapToDTO(LeaveRequest leave) {
        return new LeaveResponseDTO(
                leave.getId(),
                leave.getUser().getFullName(),
                leave.getLeaveType(),
                leave.getStartDate(),
                leave.getEndDate(),
                leave.getReason(),
                leave.getStatus(),
                leave.getRejectionReason()
        );
    }
}