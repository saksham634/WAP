package com.wap.controller;

import com.wap.dto.ApiResponse;
import com.wap.dto.AttendanceStatusResponse;
import com.wap.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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

    @Operation(summary = "Reset organization attendance records for today/selected date (HR / Admin)")
    @PostMapping({"/reset-org", "/reset-all"})
    public ResponseEntity<?> resetOrgAttendance(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        attendanceService.resetOrgAttendance(date);
        return ResponseEntity.ok(ApiResponse.success("Organization attendance reset successfully.", Map.of("message", "Organization attendance reset successfully.")));
    }

    @Operation(summary = "Get authenticated employee's monthly attendance history & duration")
    @GetMapping({"/my", "/my-attendance", "/history"})
    public ResponseEntity<?> getMyAttendance(@RequestParam(required = false) Integer month,
                                            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(attendanceService.getMyAttendanceHistory(month, year));
    }

    @Operation(summary = "Get full organization daily attendance summary (HR / Admin)")
    @GetMapping({"/org-today", "/all"})
    public ResponseEntity<?> getOrgTodayAttendance(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getOrgTodayAttendance(date));
    }
}