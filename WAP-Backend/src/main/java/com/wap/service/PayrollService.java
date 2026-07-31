package com.wap.service;

import com.wap.dto.GeneratePayrollRequest;
import com.wap.dto.PayrollResponseDTO;
import com.wap.entity.Payroll;
import com.wap.entity.User;
import com.wap.repository.AttendanceRepository;
import com.wap.repository.PayrollRepository;
import com.wap.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;

    public PayrollService(PayrollRepository payrollRepository, UserRepository userRepository, AttendanceRepository attendanceRepository) {
        this.payrollRepository = payrollRepository;
        this.userRepository = userRepository;
        this.attendanceRepository = attendanceRepository;
    }

    // HR/Admin: Generate a Payslip
    public PayrollResponseDTO generatePayroll(GeneratePayrollRequest request) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        com.wap.util.PermissionUtil.validatePermission(admin, "PAYROLL_ADMIN");

        User employee = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Check if payroll already exists to prevent double payment
        Optional<Payroll> existingPayroll = payrollRepository.findByUser_IdAndPayMonthAndPayYear(
                employee.getId(), request.getMonth(), request.getYear());
        
        if (existingPayroll.isPresent()) {
            throw new RuntimeException("Payroll already generated for this month and year.");
        }

        // Calculate Days and Salary
        int daysInMonth = YearMonth.of(request.getYear(), request.getMonth()).lengthOfMonth();
        int presentDays = attendanceRepository.countPresentDaysByMonthAndYear(employee.getId(), request.getMonth(), request.getYear());
        
        Double empBase = employee.getBaseSalary() != null ? employee.getBaseSalary() : 0.0;
        Double empAllow = employee.getAllowances() != null ? employee.getAllowances() : 0.0;
        Double empDed = employee.getDeductions() != null ? employee.getDeductions() : 0.0;
        
        if (empBase == 0.0) {
            throw new RuntimeException("Employee salary structure is not configured.");
        }

        // Financial Math
        double perDaySalary = empBase / daysInMonth;
        double earnedBase = perDaySalary * presentDays;
        
        // Base + Allowances - Absence Deductions - Fixed Deductions
        double netSalary = earnedBase + empAllow - empDed;
        if (netSalary < 0) netSalary = 0.0;
        
        double deductions = (empBase + empAllow) - netSalary;

        // Create and Save Record
        Payroll payroll = new Payroll();
        payroll.setUser(employee);
        payroll.setPayMonth(request.getMonth());
        payroll.setPayYear(request.getYear());
        payroll.setBaseSalary(empBase);
        payroll.setAllowances(empAllow);
        payroll.setPresentDays(presentDays);
        payroll.setDeductions(Math.round(deductions * 100.0) / 100.0); // Round to 2 decimal places
        payroll.setNetSalary(Math.round(netSalary * 100.0) / 100.0);
        payroll.setStatus("PROCESSED");

        payrollRepository.save(payroll);

        return mapToDTO(payroll);
    }

    // Employee: View own payslips
    public List<PayrollResponseDTO> getMyPayslips() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        com.wap.util.PermissionUtil.validatePermission(user, "PAYROLL");

        List<Payroll> payrolls = payrollRepository.findByUser_IdOrderByPayYearDescPayMonthDesc(user.getId());

        if (payrolls.isEmpty()) {
            // Seed current month payslip for employee
            int month = java.time.LocalDate.now().getMonthValue();
            int year = java.time.LocalDate.now().getYear();
            
            Payroll p1 = new Payroll();
            p1.setUser(user);
            p1.setPayMonth(month);
            p1.setPayYear(year);
            p1.setBaseSalary(85000.0);
            p1.setAllowances(5000.0);
            p1.setPresentDays(22);
            p1.setDeductions(5000.0);
            p1.setNetSalary(85000.0);
            p1.setStatus("PROCESSED");
            payrollRepository.save(p1);

            payrolls = payrollRepository.findByUser_IdOrderByPayYearDescPayMonthDesc(user.getId());
        }

        return payrolls.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // HR/Admin: View all organization payslips
    public List<PayrollResponseDTO> getAllOrganizationPayslips() {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        com.wap.util.PermissionUtil.validatePermission(admin, "PAYROLL_ADMIN");

        List<Payroll> payrolls = payrollRepository.findByUser_Organization_IdOrderByPayYearDescPayMonthDesc(admin.getOrganization().getId());
        return payrolls.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // Helper Method
    private PayrollResponseDTO mapToDTO(Payroll payroll) {
        String payPeriod = payroll.getPayMonth() + "/" + payroll.getPayYear();
        return new PayrollResponseDTO(
                payroll.getId(),
                payroll.getUser().getFullName(),
                payroll.getUser().getEmployeeId(),
                payPeriod,
                payroll.getBaseSalary(),
                payroll.getAllowances(),
                payroll.getPresentDays(),
                payroll.getDeductions(),
                payroll.getNetSalary(),
                payroll.getStatus()
        );
    }
}