package com.wap.controller;

import com.wap.dto.ApiResponse;
import com.wap.dto.PayrollResponseDTO;
import com.wap.service.AdminService;
import com.wap.service.PayrollService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
@Tag(name = "Payroll & Compensation", description = "Endpoints for monthly payroll processing, salary structures, and payslip generation")
public class PayrollController {

    private final PayrollService payrollService;
    private final AdminService adminService;

    public PayrollController(PayrollService payrollService, AdminService adminService) {
        this.payrollService = payrollService;
        this.adminService = adminService;
    }

    // ==========================================
    // HR / ADMIN ENDPOINTS
    // ==========================================
    @Operation(summary = "Process and generate payroll batch or individual payslip (HR / Admin)")
    @PostMapping({"/hr/generate", "/generate", "/process", "/batch"})
    public ResponseEntity<?> generatePayroll(@RequestBody(required = false) Map<String, Object> payload) {
        return ResponseEntity.ok(payrollService.processBatchOrIndividual(payload));
    }

    @Operation(summary = "Get all organization payslips (HR / Admin)")
    @GetMapping({"/hr/all", "/all"})
    public ResponseEntity<?> getAllOrganizationPayslips(@RequestParam(required = false) Integer month,
                                                        @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(payrollService.getAllOrganizationPayslips(month, year));
    }

    @Operation(summary = "Update employee salary structure (base, allowances, deductions)")
    @PutMapping({"/salary-structure/{id}", "/users/{id}/salary", "/salary/{id}"})
    public ResponseEntity<?> updateSalaryStructure(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        Double baseSalary = payload.get("baseSalary") != null ? Double.parseDouble(payload.get("baseSalary").toString()) : null;
        Double allowances = payload.get("allowances") != null ? Double.parseDouble(payload.get("allowances").toString()) : null;
        Double deductions = payload.get("deductions") != null ? Double.parseDouble(payload.get("deductions").toString()) : null;
        adminService.updateSalaryStructure(id, baseSalary, allowances, deductions);
        return ResponseEntity.ok(ApiResponse.success("Salary structure updated successfully for " + id, Map.of("message", "Salary structure updated successfully for " + id)));
    }

    // ==========================================
    // EMPLOYEE ENDPOINTS
    // ==========================================
    @Operation(summary = "Get authenticated employee's payslips history")
    @GetMapping({"/my-payslips", "/my"})
    public ResponseEntity<List<PayrollResponseDTO>> getMyPayslips() {
        return ResponseEntity.ok(payrollService.getMyPayslips());
    }
}