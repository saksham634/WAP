package com.wap.controller;

import com.wap.dto.ApiResponse;
import com.wap.dto.AttendanceStatusResponse;
import com.wap.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@Tag(name = "Attendance Management", description = "Endpoints for employee daily check-in/out, status check, and HR organization attendance monitoring")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @Operation(summary = "Get current user's today attendance status")
    @GetMapping({"/status", "/today"})
    public ResponseEntity<AttendanceStatusResponse> getStatus() {
        return ResponseEntity.ok(attendanceService.getTodayStatus());
    }

    @Operation(summary = "Record check-in time for authenticated user")
    @PostMapping({"/check-in", "/punch-in"})
    public ResponseEntity<?> checkIn() {
        return ResponseEntity.ok(attendanceService.checkIn());
    }

    @Operation(summary = "Record check-out time for authenticated user")
    @PostMapping({"/check-out", "/punch-out"})
    public ResponseEntity<?> checkOut() {
        return ResponseEntity.ok(attendanceService.checkOut());
    }

    @Operation(summary = "Reset today's attendance record (for testing/corrections)")
    @PostMapping({"/reset", "/reset-today"})
    public ResponseEntity<?> resetToday() {
        attendanceService.resetTodayAttendance();
        return ResponseEntity.ok(ApiResponse.success("Today's attendance has been reset.", Map.of("message", "Today's attendance has been reset for testing.")));
    }

    @Operation(summary = "Get full organization daily attendance summary (HR / Admin)")
    @GetMapping({"/org-today", "/all"})
    public ResponseEntity<?> getOrgTodayAttendance() {
        return ResponseEntity.ok(attendanceService.getOrgTodayAttendance());
    }
}