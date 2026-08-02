package com.wap.controller;

import com.wap.dto.PayrollResponseDTO;
import com.wap.service.AdminService;
import com.wap.service.PayrollService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = "*")
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
    @PostMapping({"/hr/generate", "/generate", "/process", "/batch"})
    public ResponseEntity<?> generatePayroll(@RequestBody(required = false) Map<String, Object> payload) {
        try {
            return ResponseEntity.ok(payrollService.processBatchOrIndividual(payload));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage(), "message", e.getMessage()));
        }
    }

    @GetMapping({"/hr/all", "/all"})
    public ResponseEntity<?> getAllOrganizationPayslips() {
        try {
            return ResponseEntity.ok(payrollService.getAllOrganizationPayslips());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage(), "message", e.getMessage()));
        }
    }

    @PutMapping({"/salary-structure/{id}", "/users/{id}/salary", "/salary/{id}"})
    public ResponseEntity<?> updateSalaryStructure(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        try {
            Double baseSalary = payload.get("baseSalary") != null ? Double.parseDouble(payload.get("baseSalary").toString()) : null;
            Double allowances = payload.get("allowances") != null ? Double.parseDouble(payload.get("allowances").toString()) : null;
            Double deductions = payload.get("deductions") != null ? Double.parseDouble(payload.get("deductions").toString()) : null;
            adminService.updateSalaryStructure(id, baseSalary, allowances, deductions);
            return ResponseEntity.ok(Map.of("message", "Salary structure updated successfully for " + id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================================
    // EMPLOYEE ENDPOINTS
    // ==========================================
    @GetMapping({"/my-payslips", "/my"})
    public ResponseEntity<List<PayrollResponseDTO>> getMyPayslips() {
        return ResponseEntity.ok(payrollService.getMyPayslips());
    }
}