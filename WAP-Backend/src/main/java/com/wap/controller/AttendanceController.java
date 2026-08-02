package com.wap.controller;

import com.wap.dto.AttendanceStatusResponse;
import com.wap.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/status")
    public ResponseEntity<AttendanceStatusResponse> getStatus() {
        return ResponseEntity.ok(attendanceService.getTodayStatus());
    }

    @PostMapping("/check-in")
    public ResponseEntity<?> checkIn() {
        try {
            return ResponseEntity.ok(attendanceService.checkIn());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage(), "message", e.getMessage()));
        }
    }

    @PostMapping("/check-out")
    public ResponseEntity<?> checkOut() {
        try {
            return ResponseEntity.ok(attendanceService.checkOut());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage(), "message", e.getMessage()));
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetToday() {
        try {
            attendanceService.resetTodayAttendance();
            return ResponseEntity.ok(java.util.Map.of("message", "Today's attendance has been reset for testing."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage(), "message", e.getMessage()));
        }
    }

    @GetMapping("/org-today")
    public ResponseEntity<?> getOrgTodayAttendance() {
        try {
            return ResponseEntity.ok(attendanceService.getOrgTodayAttendance());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}