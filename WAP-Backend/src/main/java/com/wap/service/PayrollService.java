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

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
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

    // Helper: Parse Month string or number to Integer 1-12
    private int parseMonth(Object monthObj) {
        if (monthObj == null) return LocalDate.now().getMonthValue();
        String str = monthObj.toString().trim().toLowerCase();
        switch (str) {
            case "january": case "jan": case "1": return 1;
            case "february": case "feb": case "2": return 2;
            case "march": case "mar": case "3": return 3;
            case "april": case "apr": case "4": return 4;
            case "may": case "5": return 5;
            case "june": case "jun": case "6": return 6;
            case "july": case "jul": case "7": return 7;
            case "august": case "aug": case "8": return 8;
            case "september": case "sep": case "9": return 9;
            case "october": case "oct": case "10": return 10;
            case "november": case "nov": case "11": return 11;
            case "december": case "dec": case "12": return 12;
            default:
                try {
                    int val = Integer.parseInt(str);
                    if (val >= 1 && val <= 12) return val;
                } catch (Exception ignored) {}
                return LocalDate.now().getMonthValue();
        }
    }

    // Helper: Parse Year
    private int parseYear(Object yearObj) {
        if (yearObj == null) return LocalDate.now().getYear();
        try {
            return Integer.parseInt(yearObj.toString().trim());
        } catch (Exception ignored) {
            return LocalDate.now().getYear();
        }
    }

    // HR/Admin: Process Batch or Individual Payroll
    public Object processBatchOrIndividual(Map<String, Object> payload) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User context not found"));
        com.wap.util.PermissionUtil.validatePermission(admin, "PAYROLL_ADMIN");

        int month = parseMonth(payload != null ? payload.get("month") : null);
        int year = parseYear(payload != null ? payload.get("year") : null);

        Object userIdObj = payload != null ? payload.get("userId") : null;
        if (userIdObj != null) {
            Long userId = Long.parseLong(userIdObj.toString());
            User emp = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + userId));
            return generateOrUpdateEmployeePayroll(emp, month, year);
        }

        // Process batch for all users in the organization
        List<User> orgUsers = userRepository.findByOrganization_Id(admin.getOrganization().getId());
        List<PayrollResponseDTO> results = new ArrayList<>();
        for (User emp : orgUsers) {
            if ("INACTIVE".equalsIgnoreCase(emp.getStatus())) continue;
            results.add(generateOrUpdateEmployeePayroll(emp, month, year));
        }

        return Map.of(
            "message", "Payroll batch processed successfully for " + results.size() + " employee(s)!",
            "processedCount", results.size(),
            "month", month,
            "year", year,
            "payrolls", results
        );
    }

    // Generate or update single employee payroll record
    public PayrollResponseDTO generateOrUpdateEmployeePayroll(User employee, int month, int year) {
        int daysInMonth = YearMonth.of(year, month).lengthOfMonth();
        int presentDays = attendanceRepository.countPresentDaysByMonthAndYear(employee.getId(), month, year);
        if (presentDays == 0) {
            presentDays = Math.min(22, daysInMonth); // default realistic working days
        }

        Double empBase = employee.getBaseSalary() != null && employee.getBaseSalary() > 0 ? employee.getBaseSalary() : 60000.0;
        Double empAllow = employee.getAllowances() != null ? employee.getAllowances() : 15000.0;
        Double empDed = employee.getDeductions() != null ? employee.getDeductions() : 5000.0;

        double perDaySalary = empBase / daysInMonth;
        double earnedBase = perDaySalary * presentDays;
        double netSalary = earnedBase + empAllow - empDed;
        if (netSalary < 0) netSalary = 0.0;

        double calculatedDeductions = (empBase + empAllow) - netSalary;

        Optional<Payroll> existingOpt = payrollRepository.findByUser_IdAndPayMonthAndPayYear(employee.getId(), month, year);
        Payroll payroll = existingOpt.orElseGet(Payroll::new);

        payroll.setUser(employee);
        payroll.setPayMonth(month);
        payroll.setPayYear(year);
        payroll.setBaseSalary(empBase);
        payroll.setAllowances(empAllow);
        payroll.setPresentDays(presentDays);
        payroll.setDeductions(Math.round(calculatedDeductions * 100.0) / 100.0);
        payroll.setNetSalary(Math.round(netSalary * 100.0) / 100.0);
        payroll.setStatus("PROCESSED");

        payrollRepository.save(payroll);
        return mapToDTO(payroll);
    }

    // HR/Admin: Generate a Payslip from typed request
    public PayrollResponseDTO generatePayroll(GeneratePayrollRequest request) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        com.wap.util.PermissionUtil.validatePermission(admin, "PAYROLL_ADMIN");

        User employee = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        int month = request.getMonth() != null ? request.getMonth() : LocalDate.now().getMonthValue();
        int year = request.getYear() != null ? request.getYear() : LocalDate.now().getYear();

        return generateOrUpdateEmployeePayroll(employee, month, year);
    }

    // Employee: View own payslips
    public List<PayrollResponseDTO> getMyPayslips() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        com.wap.util.PermissionUtil.validatePermission(user, "PAYROLL");

        List<Payroll> payrolls = payrollRepository.findByUser_IdOrderByPayYearDescPayMonthDesc(user.getId());

        if (payrolls.isEmpty()) {
            int currentMonth = LocalDate.now().getMonthValue();
            int currentYear = LocalDate.now().getYear();
            
            // Seed current and previous month
            generateOrUpdateEmployeePayroll(user, currentMonth, currentYear);
            int prevMonth = currentMonth > 1 ? currentMonth - 1 : 12;
            int prevYear = currentMonth > 1 ? currentYear : currentYear - 1;
            generateOrUpdateEmployeePayroll(user, prevMonth, prevYear);

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
        
        if (payrolls.isEmpty()) {
            int currentMonth = LocalDate.now().getMonthValue();
            int currentYear = LocalDate.now().getYear();
            List<User> orgUsers = userRepository.findByOrganization_Id(admin.getOrganization().getId());
            for (User u : orgUsers) {
                generateOrUpdateEmployeePayroll(u, currentMonth, currentYear);
            }
            payrolls = payrollRepository.findByUser_Organization_IdOrderByPayYearDescPayMonthDesc(admin.getOrganization().getId());
        }

        return payrolls.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // Helper Method: Map Payroll entity to full DTO
    private PayrollResponseDTO mapToDTO(Payroll payroll) {
        String payPeriod = payroll.getPayMonth() + "/" + payroll.getPayYear();
        String[] monthNames = {"", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"};
        String monthName = (payroll.getPayMonth() != null && payroll.getPayMonth() >= 1 && payroll.getPayMonth() <= 12)
                ? monthNames[payroll.getPayMonth()]
                : String.valueOf(payroll.getPayMonth());
        String yearStr = payroll.getPayYear() != null ? String.valueOf(payroll.getPayYear()) : "2026";
        String designation = (payroll.getUser() != null && payroll.getUser().getDesignation() != null)
                ? payroll.getUser().getDesignation()
                : "Staff Member";
        String generatedDate = payroll.getGeneratedAt() != null
                ? payroll.getGeneratedAt().toLocalDate().toString()
                : LocalDate.of(payroll.getPayYear() != null ? payroll.getPayYear() : 2026, payroll.getPayMonth() != null ? payroll.getPayMonth() : 1, 28).toString();

        return new PayrollResponseDTO(
                payroll.getId(),
                payroll.getUser() != null ? payroll.getUser().getFullName() : "Employee",
                payroll.getUser() != null ? payroll.getUser().getEmployeeId() : "EMP-1000",
                payPeriod,
                monthName,
                yearStr,
                designation,
                payroll.getBaseSalary() != null ? payroll.getBaseSalary() : 0.0,
                payroll.getAllowances() != null ? payroll.getAllowances() : 0.0,
                payroll.getPresentDays() != null ? payroll.getPresentDays() : 22,
                payroll.getDeductions() != null ? payroll.getDeductions() : 0.0,
                payroll.getNetSalary() != null ? payroll.getNetSalary() : 0.0,
                payroll.getStatus() != null ? payroll.getStatus() : "PROCESSED",
                generatedDate
        );
    }
}