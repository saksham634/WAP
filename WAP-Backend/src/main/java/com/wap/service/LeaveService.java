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

    // HR/Admin: View all pending requests company-wide
    public List<LeaveResponseDTO> getPendingLeaves() {
        List<LeaveRequest> requests = leaveRepository.findByStatusOrderByCreatedAtDesc("PENDING");
        return requests.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // HR/Admin: Approve or Reject a request
    public void updateLeaveStatus(Long leaveId, String newStatus) {
        LeaveRequest leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        
        leave.setStatus(newStatus.toUpperCase());
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
                leave.getStatus()
        );
    }
}