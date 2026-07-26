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
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/check-out")
    public ResponseEntity<?> checkOut() {
        try {
            return ResponseEntity.ok(attendanceService.checkOut());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}