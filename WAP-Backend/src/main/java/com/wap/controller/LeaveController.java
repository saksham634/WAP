package com.wap.controller;

import com.wap.dto.LeaveResponseDTO;
import com.wap.dto.LeaveSubmitRequest;
import com.wap.service.LeaveService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leave")
@CrossOrigin(origins = "*")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    // ==========================================
    // EMPLOYEE ENDPOINTS
    // ==========================================
    
    @PostMapping("/submit")
    public ResponseEntity<?> submitLeave(@RequestBody LeaveSubmitRequest request) {
        try {
            leaveService.submitLeaveRequest(request);
            return ResponseEntity.ok(Map.of("message", "Leave request submitted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyLeave(@RequestBody LeaveSubmitRequest request) {
        return submitLeave(request);
    }

    @GetMapping("/my-leaves")
    public ResponseEntity<List<LeaveResponseDTO>> getMyLeaves() {
        return ResponseEntity.ok(leaveService.getMyLeaves());
    }

    @GetMapping("/summary")
    public ResponseEntity<com.wap.dto.LeaveSummaryDTO> getLeaveSummary() {
        return ResponseEntity.ok(leaveService.getLeaveSummary());
    }

    // ==========================================
    // HR / ADMIN ENDPOINTS
    // ==========================================
    
    @GetMapping("/hr/pending")
    public ResponseEntity<List<LeaveResponseDTO>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingLeaves());
    }

    @PutMapping("/hr/update/{id}")
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
}