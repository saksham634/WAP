package com.wap.controller;

import com.wap.dto.GeneratePayrollRequest;
import com.wap.dto.PayrollResponseDTO;
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

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    // ==========================================
    // HR / ADMIN ENDPOINTS
    // ==========================================
    @PostMapping("/hr/generate")
    public ResponseEntity<?> generatePayroll(@RequestBody GeneratePayrollRequest request) {
        try {
            PayrollResponseDTO response = payrollService.generatePayroll(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/hr/all")
    public ResponseEntity<?> getAllOrganizationPayslips() {
        try {
            return ResponseEntity.ok(payrollService.getAllOrganizationPayslips());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================================
    // EMPLOYEE ENDPOINTS
    // ==========================================
    @GetMapping("/my-payslips")
    public ResponseEntity<List<PayrollResponseDTO>> getMyPayslips() {
        return ResponseEntity.ok(payrollService.getMyPayslips());
    }
}