package com.wap.service;

import com.wap.dto.EmployeeDashboardDTO;
import com.wap.dto.AttendanceStatusResponse;
import com.wap.entity.Attendance;
import com.wap.entity.LeaveRequest;
import com.wap.entity.User;
import com.wap.repository.AttendanceRepository;
import com.wap.repository.LeaveRequestRepository;
import com.wap.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, UserRepository userRepository, LeaveRequestRepository leaveRequestRepository) {
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
        this.leaveRequestRepository = leaveRequestRepository;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public AttendanceStatusResponse getTodayStatus() {
        User user = getAuthenticatedUser();
        Optional<Attendance> todayRecord = attendanceRepository.findByUser_IdAndRecordDate(user.getId(), LocalDate.now());

        if (todayRecord.isEmpty()) {
            return new AttendanceStatusResponse("NOT_CHECKED_IN", null, null);
        }

        Attendance attendance = todayRecord.get();
        String checkInStr = attendance.getCheckInTime() != null ? attendance.getCheckInTime().format(DateTimeFormatter.ofPattern("HH:mm:ss")) : null;
        String checkOutStr = attendance.getCheckOutTime() != null ? attendance.getCheckOutTime().format(DateTimeFormatter.ofPattern("HH:mm:ss")) : null;

        if (attendance.getCheckOutTime() != null) {
            return new AttendanceStatusResponse("CHECKED_OUT", checkInStr, checkOutStr);
        } else {
            return new AttendanceStatusResponse("CHECKED_IN", checkInStr, null);
        }
    }

    public AttendanceStatusResponse checkIn() {
        User user = getAuthenticatedUser();
        com.wap.util.PermissionUtil.validatePermission(user, "ATTENDANCE");
        LocalDate today = LocalDate.now();
        
        Optional<Attendance> existingRecord = attendanceRepository.findByUser_IdAndRecordDate(user.getId(), today);
        if (existingRecord.isPresent()) {
            throw new RuntimeException("Already checked in today.");
        }

        Attendance newAttendance = new Attendance();
        newAttendance.setUser(user);
        newAttendance.setRecordDate(today);
        newAttendance.setCheckInTime(LocalTime.now());
        newAttendance.setStatus("PRESENT");
        
        attendanceRepository.save(newAttendance);
        
        return getTodayStatus();
    }

    public AttendanceStatusResponse checkOut() {
        User user = getAuthenticatedUser();
        com.wap.util.PermissionUtil.validatePermission(user, "ATTENDANCE");
        LocalDate today = LocalDate.now();
        
        Attendance attendance = attendanceRepository.findByUser_IdAndRecordDate(user.getId(), today)
                .orElseThrow(() -> new RuntimeException("Cannot check out without checking in first."));
                
        if (attendance.getCheckOutTime() != null) {
            throw new RuntimeException("Already checked out today.");
        }

        attendance.setCheckOutTime(LocalTime.now());
        attendanceRepository.save(attendance);
        
        return getTodayStatus();
    }

    public void resetTodayAttendance() {
        User user = getAuthenticatedUser();
        LocalDate today = LocalDate.now();
        
        Optional<Attendance> attendance = attendanceRepository.findByUser_IdAndRecordDate(user.getId(), today);
        attendance.ifPresent(attendanceRepository::delete);
    }

    public EmployeeDashboardDTO getEmployeeDashboardMetrics() {
        User user = getAuthenticatedUser();
        
        // 1. Calculate Today's Status
        String status = "Not Checked In";
        AttendanceStatusResponse todayStatus = getTodayStatus();
        if ("CHECKED_IN".equals(todayStatus.getStatus())) {
            status = "Working";
        } else if ("CHECKED_OUT".equals(todayStatus.getStatus())) {
            status = "Checked Out";
        }
        
        // Check if on leave today
        List<LeaveRequest> allLeaves = leaveRequestRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());
        LocalDate today = LocalDate.now();
        int leavesTaken = 0;
        
        for (LeaveRequest lr : allLeaves) {
            if ("APPROVED".equals(lr.getStatus())) {
                long days = ChronoUnit.DAYS.between(lr.getStartDate(), lr.getEndDate()) + 1;
                leavesTaken += days;
                
                if (!today.isBefore(lr.getStartDate()) && !today.isAfter(lr.getEndDate())) {
                    status = "On Leave";
                }
            }
        }
        
        int totalLeaveAllowance = 24; // Base allowance for the year
        int balanceLeaves = Math.max(0, totalLeaveAllowance - leavesTaken);
        
        // Calculate real attendance % based on database check-in records vs working days elapsed
        int month = LocalDate.now().getMonthValue();
        int year = LocalDate.now().getYear();
        int presentDays = attendanceRepository.countPresentDaysByMonthAndYear(user.getId(), month, year);

        int dayOfMonth = LocalDate.now().getDayOfMonth();
        int workingDaysElapsed = 0;
        for (int d = 1; d <= dayOfMonth; d++) {
            LocalDate date = LocalDate.of(year, month, d);
            if (date.getDayOfWeek().getValue() <= 5) {
                workingDaysElapsed++;
            }
        }
        if (workingDaysElapsed == 0) workingDaysElapsed = 1;

        int pct = workingDaysElapsed == 0 ? 0 : Math.min(100, Math.max(0, (int) Math.round((double) presentDays / workingDaysElapsed * 100)));
        String attendancePercentage = pct + "%";

        // Dynamic Weekly Attendance Trend (Current Calendar Week: Mon to Sun - resets every week)
        java.util.Map<String, Double> weeklyAttendanceTrend = new java.util.LinkedHashMap<>();
        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("EEE", Locale.ENGLISH);
        LocalDate startOfWeek = today.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        
        for (int i = 0; i < 7; i++) {
            LocalDate d = startOfWeek.plusDays(i);
            String dayName = d.format(dayFmt);
            if (d.isAfter(today)) {
                weeklyAttendanceTrend.put(dayName, 0.0);
            } else {
                java.util.Optional<Attendance> optAtt = attendanceRepository.findByUser_IdAndRecordDate(user.getId(), d);
                if (optAtt.isPresent()) {
                    Attendance att = optAtt.get();
                    if (att.getCheckInTime() != null && att.getCheckOutTime() != null) {
                        double hrs = java.time.Duration.between(att.getCheckInTime(), att.getCheckOutTime()).toMinutes() / 60.0;
                        weeklyAttendanceTrend.put(dayName, Math.round(hrs * 10.0) / 10.0);
                    } else if (att.getCheckInTime() != null) {
                        // Currently checked in today
                        double hrs = java.time.Duration.between(att.getCheckInTime(), java.time.LocalTime.now()).toMinutes() / 60.0;
                        double val = Math.max(4.0, Math.min(9.0, Math.round(hrs * 10.0) / 10.0));
                        weeklyAttendanceTrend.put(dayName, val);
                    } else {
                        weeklyAttendanceTrend.put(dayName, 8.0);
                    }
                } else {
                    weeklyAttendanceTrend.put(dayName, 0.0);
                }
            }
        }

        // Dynamic Monthly Attendance Trend (Current Calendar Month: Week 1 to Week 5 - resets every month)
        java.util.Map<String, Double> monthlyAttendanceTrend = new java.util.LinkedHashMap<>();
        int daysInMonth = today.lengthOfMonth();
        int totalWeeks = (int) Math.ceil((double) daysInMonth / 7.0);

        for (int w = 1; w <= totalWeeks; w++) {
            int startDay = (w - 1) * 7 + 1;
            int endDay = Math.min(w * 7, daysInMonth);
            double weekHoursSum = 0.0;
            int daysWithAttendance = 0;

            for (int d = startDay; d <= endDay; d++) {
                LocalDate date = today.withDayOfMonth(d);
                if (!date.isAfter(today)) {
                    java.util.Optional<Attendance> optAtt = attendanceRepository.findByUser_IdAndRecordDate(user.getId(), date);
                    if (optAtt.isPresent()) {
                        Attendance att = optAtt.get();
                        if (att.getCheckInTime() != null && att.getCheckOutTime() != null) {
                            double hrs = java.time.Duration.between(att.getCheckInTime(), att.getCheckOutTime()).toMinutes() / 60.0;
                            weekHoursSum += hrs;
                        } else {
                            weekHoursSum += 8.0;
                        }
                        daysWithAttendance++;
                    }
                }
            }
            double avgDailyHours = daysWithAttendance > 0 ? Math.round((weekHoursSum / daysWithAttendance) * 10.0) / 10.0 : 0.0;
            monthlyAttendanceTrend.put("Week " + w, avgDailyHours);
        }
        
        return new EmployeeDashboardDTO(attendancePercentage, leavesTaken, balanceLeaves, status, weeklyAttendanceTrend, monthlyAttendanceTrend);
    }

    // HR: Get today's real-time attendance feed for the organization
    public List<java.util.Map<String, Object>> getOrgTodayAttendance() {
        User user = getAuthenticatedUser();
        Long orgId = user.getOrganization().getId();
        LocalDate today = LocalDate.now();
        
        List<Attendance> records = attendanceRepository.findByUser_Organization_IdAndRecordDate(orgId, today);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("hh:mm a");
        
        return records.stream().map(a -> {
            java.util.Map<String, Object> map = new java.util.LinkedHashMap<>();
            map.put("employeeId", a.getUser().getEmployeeId());
            map.put("fullName", a.getUser().getFullName());
            map.put("checkIn", a.getCheckInTime() != null ? a.getCheckInTime().format(fmt) : null);
            map.put("checkOut", a.getCheckOutTime() != null ? a.getCheckOutTime().format(fmt) : null);
            map.put("status", a.getStatus());
            return map;
        }).collect(java.util.stream.Collectors.toList());
    }
}