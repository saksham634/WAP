package com.wap.controller;

import com.wap.dto.LeaveResponseDTO;
import com.wap.dto.LeaveSubmitRequest;
import com.wap.service.LeaveService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/leave", "/api/leaves"})
@CrossOrigin(origins = "*")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    // ==========================================
    // EMPLOYEE ENDPOINTS
    // ==========================================
    
    @PostMapping({"", "/submit", "/apply"})
    public ResponseEntity<?> submitLeave(@RequestBody LeaveSubmitRequest request) {
        try {
            leaveService.submitLeaveRequest(request);
            return ResponseEntity.ok(Map.of("message", "Leave request submitted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping({"/my-leaves", "/my"})
    public ResponseEntity<List<LeaveResponseDTO>> getMyLeaves() {
        return ResponseEntity.ok(leaveService.getMyLeaves());
    }

    @GetMapping({"/summary", "/balance"})
    public ResponseEntity<com.wap.dto.LeaveSummaryDTO> getLeaveSummary() {
        return ResponseEntity.ok(leaveService.getLeaveSummary());
    }

    // ==========================================
    // HR / ADMIN ENDPOINTS
    // ==========================================
    
    @GetMapping({"", "/hr/all", "/all"})
    public ResponseEntity<List<LeaveResponseDTO>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllOrganizationLeaves());
    }

    @GetMapping({"/hr/pending", "/pending"})
    public ResponseEntity<List<LeaveResponseDTO>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingLeaves());
    }

    @PutMapping({"/hr/update/{id}", "/{id}/update", "/{id}/status"})
    public ResponseEntity<?> updateLeaveStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String status = payload.get("status"); // "APPROVED" or "REJECTED"
            String reason = payload.getOrDefault("reason", null);
            leaveService.updateLeaveStatus(id, status, reason);
            return ResponseEntity.ok(Map.of("message", "Leave status updated to " + status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveLeave(@PathVariable Long id) {
        try {
            leaveService.updateLeaveStatus(id, "APPROVED", null);
            return ResponseEntity.ok(Map.of("message", "Leave status updated to APPROVED"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectLeave(@PathVariable Long id, @RequestBody(required = false) Map<String, String> payload) {
        try {
            String reason = payload != null ? payload.getOrDefault("reason", "Not approved") : "Not approved";
            leaveService.updateLeaveStatus(id, "REJECTED", reason);
            return ResponseEntity.ok(Map.of("message", "Leave status updated to REJECTED"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}