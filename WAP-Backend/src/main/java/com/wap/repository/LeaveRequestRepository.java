package com.wap.repository;

import com.wap.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    
    // Fetch all leave requests made by a specific employee
    List<LeaveRequest> findByUser_IdOrderByCreatedAtDesc(Long userId);
    
    // Fetch all leave requests across the company with a specific status (e.g., "PENDING")
    List<LeaveRequest> findByStatusOrderByCreatedAtDesc(String status);
    
    long countByStatus(String status);

    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.status = 'APPROVED' AND :date BETWEEN l.startDate AND l.endDate")
    long countActiveLeavesByDate(@Param("date") LocalDate date);

    // Organization-Scoped Methods
    List<LeaveRequest> findByUser_Organization_IdOrderByCreatedAtDesc(Long orgId);

    List<LeaveRequest> findByUser_Organization_IdAndStatusOrderByCreatedAtDesc(Long orgId, String status);

    long countByUser_Organization_IdAndStatus(Long orgId, String status);

    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.user.organization.id = :orgId AND l.status = 'APPROVED' AND :date BETWEEN l.startDate AND l.endDate")
    long countActiveLeavesByOrganization_IdAndDate(@Param("orgId") Long orgId, @Param("date") LocalDate date);

    void deleteByUser_Id(Long userId);
}