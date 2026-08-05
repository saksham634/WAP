package com.wap.service;

import com.wap.dto.LeaveResponseDTO;
import com.wap.dto.LeaveSubmitRequest;
import com.wap.dto.LeaveSummaryDTO;
import com.wap.entity.LeaveRequest;
import com.wap.entity.User;
import com.wap.repository.LeaveRequestRepository;
import com.wap.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    private final LeaveRequestRepository leaveRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public LeaveService(LeaveRequestRepository leaveRepository, UserRepository userRepository, AuditLogService auditLogService) {
        this.leaveRepository = leaveRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
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
        leave.setLeaveType(request.getLeaveType() != null ? request.getLeaveType().toUpperCase() : "CASUAL");
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setReason(request.getReason());
        leave.setStatus("PENDING");

        leaveRepository.save(leave);
        auditLogService.log("Submitted Leave Request (" + leave.getLeaveType() + ")", user);
    }

    // Employee: View their own leave history
    public List<LeaveResponseDTO> getMyLeaves() {
        User user = getAuthenticatedUser();
        List<LeaveRequest> requests = leaveRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());
        return requests.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // Employee: Get live leave summary KPI totals and decremented balances
    public LeaveSummaryDTO getLeaveSummary() {
        User user = getAuthenticatedUser();
        List<LeaveRequest> requests = leaveRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());

        int initialCasual = 8;
        int initialSick = 6;
        int initialPaid = 12;
        int initialTotal = 26;

        int usedCasual = 0;
        int usedSick = 0;
        int usedPaid = 0;
        int pendingLeaves = 0;

        for (LeaveRequest req : requests) {
            long days = 1;
            if (req.getStartDate() != null && req.getEndDate() != null) {
                days = Math.max(1, ChronoUnit.DAYS.between(req.getStartDate(), req.getEndDate()) + 1);
            }

            if ("APPROVED".equalsIgnoreCase(req.getStatus())) {
                String type = req.getLeaveType() != null ? req.getLeaveType().toUpperCase() : "CASUAL";
                if (type.contains("CASUAL")) {
                    usedCasual += days;
                } else if (type.contains("SICK") || type.contains("MED")) {
                    usedSick += days;
                } else {
                    usedPaid += days;
                }
            } else if ("PENDING".equalsIgnoreCase(req.getStatus())) {
                pendingLeaves++;
            }
        }

        int balanceCasual = Math.max(0, initialCasual - usedCasual);
        int balanceSick = Math.max(0, initialSick - usedSick);
        int balancePaid = Math.max(0, initialPaid - usedPaid);
        int totalUsed = usedCasual + usedSick + usedPaid;
        int totalAvailable = Math.max(0, initialTotal - totalUsed);

        return new LeaveSummaryDTO(
                balanceCasual,
                balanceSick,
                balancePaid,
                totalAvailable,
                initialTotal,
                totalUsed,
                totalAvailable,
                pendingLeaves
        );
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

        String applicantName = leave.getUser() != null ? leave.getUser().getFullName() : "Employee";
        auditLogService.log(newStatus.toUpperCase() + " Leave for " + applicantName, user);
    }

    // Helper method to convert Entity to DTO
    private LeaveResponseDTO mapToDTO(LeaveRequest leave) {
        return new LeaveResponseDTO(
                leave.getId(),
                leave.getUser() != null ? leave.getUser().getFullName() : "Staff Member",
                leave.getLeaveType(),
                leave.getStartDate(),
                leave.getEndDate(),
                leave.getReason(),
                leave.getStatus(),
                leave.getRejectionReason()
        );
    }
}