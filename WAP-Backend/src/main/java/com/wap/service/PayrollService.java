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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final AuditLogService auditLogService;

    public PayrollService(PayrollRepository payrollRepository, UserRepository userRepository,
                          AttendanceRepository attendanceRepository, AuditLogService auditLogService) {
        this.payrollRepository = payrollRepository;
        this.userRepository = userRepository;
        this.attendanceRepository = attendanceRepository;
        this.auditLogService = auditLogService;
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

        boolean isHRCaller = admin.getRole() != null && "ROLE_HR".equalsIgnoreCase(admin.getRole().getRoleName());
        int month = parseMonth(payload != null ? payload.get("month") : null);
        int year = parseYear(payload != null ? payload.get("year") : null);

        Object userIdObj = payload != null ? payload.get("userId") : null;
        if (userIdObj != null) {
            Long userId = Long.parseLong(userIdObj.toString());
            User emp = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + userId));
            if (isHRCaller && emp.getRole() != null && "ROLE_ADMIN".equalsIgnoreCase(emp.getRole().getRoleName())) {
                throw new RuntimeException("HR managers are not permitted to process payroll for Administrator accounts.");
            }
            PayrollResponseDTO dto = generateOrUpdateEmployeePayroll(emp, month, year);
            auditLogService.log("Generated Payslip for " + emp.getFullName() + " (" + month + "/" + year + ")", admin);
            return dto;
        }

        // Process batch for all users in the organization (skipping Admin for HR callers)
        Long orgId = admin.getOrganization() != null ? admin.getOrganization().getId() : null;
        List<User> orgUsers = orgId != null ? userRepository.findByOrganization_Id(orgId) : userRepository.findAll();
        if (orgUsers.isEmpty()) {
            orgUsers = userRepository.findAll();
        }
        
        List<PayrollResponseDTO> results = new ArrayList<>();
        for (User emp : orgUsers) {
            if (emp == null || "INACTIVE".equalsIgnoreCase(emp.getStatus())) continue;
            if (isHRCaller && emp.getRole() != null && "ROLE_ADMIN".equalsIgnoreCase(emp.getRole().getRoleName())) {
                continue;
            }
            try {
                results.add(generateOrUpdateEmployeePayroll(emp, month, year));
            } catch (Exception e) {
                System.err.println("Warning: failed to process payroll for employee " + emp.getEmail() + ": " + e.getMessage());
            }
        }

        auditLogService.log("Processed Monthly Payroll Batch (" + month + "/" + year + ") for " + results.size() + " employees", admin);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Payroll batch processed successfully for " + results.size() + " employee(s)!");
        response.put("processedCount", results.size());
        response.put("month", month);
        response.put("year", year);
        response.put("payrolls", results);
        return response;
    }

    // Generate or update single employee payroll record
    public PayrollResponseDTO generateOrUpdateEmployeePayroll(User employee, int month, int year) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        int daysInMonth = endDate.getDayOfMonth();
        int presentDays = 22;
        try {
            long calculatedDays = attendanceRepository.countPresentDaysBetweenDates(employee.getId(), startDate, endDate);
            if (calculatedDays > 0) {
                presentDays = (int) calculatedDays;
            } else {
                presentDays = Math.min(22, daysInMonth);
            }
        } catch (Exception e) {
            presentDays = Math.min(22, daysInMonth);
        }

        Double empBase = employee.getBaseSalary() != null && employee.getBaseSalary() > 0 ? employee.getBaseSalary() : 60000.0;
        Double empAllow = employee.getAllowances() != null ? employee.getAllowances() : 15000.0;
        Double empDed = employee.getDeductions() != null ? employee.getDeductions() : 5000.0;

        double perDaySalary = empBase / daysInMonth;
        double earnedBase = perDaySalary * presentDays;
        double netSalary = earnedBase + empAllow - empDed;
        if (netSalary < 0) netSalary = 0.0;

        double calculatedDeductions = (empBase + empAllow) - netSalary;

        List<Payroll> existingList = payrollRepository.findAllByUser_IdAndPayMonthAndPayYear(employee.getId(), month, year);
        Payroll payroll;
        if (!existingList.isEmpty()) {
            payroll = existingList.get(0);
            if (existingList.size() > 1) {
                for (int i = 1; i < existingList.size(); i++) {
                    payrollRepository.delete(existingList.get(i));
                }
            }
        } else {
            payroll = new Payroll();
            payroll.setUser(employee);
        }

        payroll.setUser(employee);
        payroll.setPayMonth(month);
        payroll.setPayYear(year);
        payroll.setBaseSalary(empBase);
        payroll.setAllowances(empAllow);
        payroll.setPresentDays(presentDays);
        payroll.setDeductions(Math.round(calculatedDeductions * 100.0) / 100.0);
        payroll.setNetSalary(Math.round(netSalary * 100.0) / 100.0);
        payroll.setStatus("PROCESSED");

        payroll = payrollRepository.saveAndFlush(payroll);
        return mapToDTO(payroll);
    }

    // HR/Admin: Generate a Payslip from typed request
    public PayrollResponseDTO generatePayroll(GeneratePayrollRequest request) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        com.wap.util.PermissionUtil.validatePermission(admin, "PAYROLL_ADMIN");

        boolean isHRCaller = admin.getRole() != null && "ROLE_HR".equalsIgnoreCase(admin.getRole().getRoleName());
        User employee = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (isHRCaller && employee.getRole() != null && "ROLE_ADMIN".equalsIgnoreCase(employee.getRole().getRoleName())) {
            throw new RuntimeException("HR managers are not permitted to generate payslips for Administrator accounts.");
        }

        int month = request.getMonth() != null ? request.getMonth() : LocalDate.now().getMonthValue();
        int year = request.getYear() != null ? request.getYear() : LocalDate.now().getYear();

        PayrollResponseDTO dto = generateOrUpdateEmployeePayroll(employee, month, year);
        auditLogService.log("Generated Payslip for " + employee.getFullName(), admin);
        return dto;
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

    // HR/Admin: View all organization payslips with optional month and year filter
    public List<PayrollResponseDTO> getAllOrganizationPayslips(Integer month, Integer year) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        com.wap.util.PermissionUtil.validatePermission(admin, "PAYROLL_ADMIN");

        boolean isHRCaller = admin.getRole() != null && "ROLE_HR".equalsIgnoreCase(admin.getRole().getRoleName());
        Long orgId = admin.getOrganization() != null ? admin.getOrganization().getId() : null;
        List<Payroll> payrolls = orgId != null 
                ? payrollRepository.findByUser_Organization_IdOrderByPayYearDescPayMonthDesc(orgId)
                : payrollRepository.findAll();
        
        int targetMonth = month != null ? month : LocalDate.now().getMonthValue();
        int targetYear = year != null ? year : LocalDate.now().getYear();

        boolean hasRecordsForMonthYear = payrolls.stream().anyMatch(p ->
                (p.getPayMonth() != null && p.getPayMonth().equals(targetMonth)) &&
                (p.getPayYear() != null && p.getPayYear().equals(targetYear))
        );

        if (!hasRecordsForMonthYear) {
            List<User> orgUsers = orgId != null ? userRepository.findByOrganization_Id(orgId) : userRepository.findAll();
            if (orgUsers.isEmpty()) {
                orgUsers = userRepository.findAll();
            }
            for (User u : orgUsers) {
                if (u == null || "INACTIVE".equalsIgnoreCase(u.getStatus())) continue;
                if (isHRCaller && u.getRole() != null && "ROLE_ADMIN".equalsIgnoreCase(u.getRole().getRoleName())) {
                    continue;
                }
                try {
                    generateOrUpdateEmployeePayroll(u, targetMonth, targetYear);
                } catch (Exception ignored) {}
            }
            payrolls = orgId != null 
                    ? payrollRepository.findByUser_Organization_IdOrderByPayYearDescPayMonthDesc(orgId)
                    : payrollRepository.findAll();
        }

        return payrolls.stream()
                .filter(p -> !(isHRCaller && p.getUser() != null && p.getUser().getRole() != null && "ROLE_ADMIN".equalsIgnoreCase(p.getUser().getRole().getRoleName())))
                .filter(p -> month == null || (p.getPayMonth() != null && p.getPayMonth().equals(month)))
                .filter(p -> year == null || (p.getPayYear() != null && p.getPayYear().equals(year)))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
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