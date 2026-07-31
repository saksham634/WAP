package com.wap.repository;

import com.wap.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    
    // Fetch all payslips for a specific employee, newest first
    List<Payroll> findByUser_IdOrderByPayYearDescPayMonthDesc(Long userId);
    
    // Check if payroll already exists for a user in a specific month/year
    Optional<Payroll> findByUser_IdAndPayMonthAndPayYear(Long userId, Integer month, Integer year);

    // Fetch all payslips for an organization
    List<Payroll> findByUser_Organization_IdOrderByPayYearDescPayMonthDesc(Long orgId);
}