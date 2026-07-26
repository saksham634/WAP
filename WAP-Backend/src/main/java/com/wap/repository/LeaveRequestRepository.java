package com.wap.repository;

import com.wap.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    
    // Fetch all leave requests made by a specific employee
    List<LeaveRequest> findByUser_IdOrderByCreatedAtDesc(Long userId);
    
    // Fetch all leave requests across the company with a specific status (e.g., "PENDING")
    List<LeaveRequest> findByStatusOrderByCreatedAtDesc(String status);
    
}