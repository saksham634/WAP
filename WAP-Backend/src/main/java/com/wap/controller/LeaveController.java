package com.wap.controller;

import com.wap.dto.ApiResponse;
import com.wap.dto.LeaveResponseDTO;
import com.wap.dto.LeaveSubmitRequest;
import com.wap.dto.LeaveSummaryDTO;
import com.wap.service.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/leave", "/api/leaves"})
@Tag(name = "Leave Management", description = "Endpoints for employee leave applications, balance inquiry, and HR approvals")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    // ==========================================
    // EMPLOYEE ENDPOINTS
    // ==========================================
    
    @Operation(summary = "Submit a new leave application")
    @PostMapping({"", "/submit", "/apply"})
    public ResponseEntity<?> submitLeave(@Valid @RequestBody LeaveSubmitRequest request) {
        leaveService.submitLeaveRequest(request);
        return ResponseEntity.ok(ApiResponse.success("Leave request submitted successfully", Map.of("message", "Leave request submitted successfully")));
    }

    @Operation(summary = "Get list of authenticated employee's submitted leaves")
    @GetMapping({"/my-leaves", "/my"})
    public ResponseEntity<List<LeaveResponseDTO>> getMyLeaves() {
        return ResponseEntity.ok(leaveService.getMyLeaves());
    }

    @Operation(summary = "Get leave balance summary for authenticated employee")
    @GetMapping({"/summary", "/balance"})
    public ResponseEntity<LeaveSummaryDTO> getLeaveSummary() {
        return ResponseEntity.ok(leaveService.getLeaveSummary());
    }

    // ==========================================
    // HR / ADMIN ENDPOINTS
    // ==========================================
    
    @Operation(summary = "Get all organization leave applications (HR / Admin)")
    @GetMapping({"", "/hr/all", "/all"})
    public ResponseEntity<List<LeaveResponseDTO>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllOrganizationLeaves());
    }

    @Operation(summary = "Get pending leave applications awaiting approval (HR / Admin)")
    @GetMapping({"/hr/pending", "/pending"})
    public ResponseEntity<List<LeaveResponseDTO>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingLeaves());
    }

    @Operation(summary = "Update status of a leave application (APPROVED/REJECTED)")
    @PutMapping({"/hr/update/{id}", "/{id}/update", "/{id}/status"})
    public ResponseEntity<?> updateLeaveStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        String reason = payload.getOrDefault("reason", null);
        if (status == null || (!status.equalsIgnoreCase("APPROVED") && !status.equalsIgnoreCase("REJECTED"))) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Status must be APPROVED or REJECTED"));
        }
        leaveService.updateLeaveStatus(id, status.toUpperCase(), reason);
        return ResponseEntity.ok(ApiResponse.success("Leave status updated to " + status, Map.of("message", "Leave status updated to " + status)));
    }

    @Operation(summary = "Quick approve a leave application")
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveLeave(@PathVariable Long id) {
        leaveService.updateLeaveStatus(id, "APPROVED", null);
        return ResponseEntity.ok(ApiResponse.success("Leave status updated to APPROVED", Map.of("message", "Leave status updated to APPROVED")));
    }

    @Operation(summary = "Quick reject a leave application with optional reason")
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectLeave(@PathVariable Long id, @RequestBody(required = false) Map<String, String> payload) {
        String reason = payload != null ? payload.getOrDefault("reason", "Not approved") : "Not approved";
        leaveService.updateLeaveStatus(id, "REJECTED", reason);
        return ResponseEntity.ok(ApiResponse.success("Leave status updated to REJECTED", Map.of("message", "Leave status updated to REJECTED")));
    }
}