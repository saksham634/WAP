package com.wap.service;

import com.wap.dto.AttendanceStatusResponse;
import com.wap.dto.EmployeeDashboardDTO;
import com.wap.entity.Attendance;
import com.wap.entity.LeaveRequest;
import com.wap.entity.User;
import com.wap.repository.AttendanceRepository;
import com.wap.repository.LeaveRequestRepository;
import com.wap.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AuditLogService auditLogService;

    public AttendanceService(AttendanceRepository attendanceRepository, UserRepository userRepository,
                             LeaveRequestRepository leaveRequestRepository, AuditLogService auditLogService) {
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.auditLogService = auditLogService;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public AttendanceStatusResponse getTodayStatus() {
        User user = getAuthenticatedUser();
        LocalDate today = LocalDate.now();

        Optional<Attendance> attendance = attendanceRepository.findByUser_IdAndRecordDate(user.getId(), today);

        if (attendance.isPresent()) {
            Attendance att = attendance.get();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
            String checkIn = att.getCheckInTime() != null ? att.getCheckInTime().format(formatter) : null;
            String checkOut = att.getCheckOutTime() != null ? att.getCheckOutTime().format(formatter) : null;
            String status = att.getCheckOutTime() != null ? "CHECKED_OUT" : "CHECKED_IN";
            return new AttendanceStatusResponse(status, checkIn, checkOut);
        }

        return new AttendanceStatusResponse("NOT_CHECKED_IN", null, null);
    }

    public AttendanceStatusResponse checkIn() {
        User user = getAuthenticatedUser();
        com.wap.util.PermissionUtil.validatePermission(user, "ATTENDANCE");
        LocalDate today = LocalDate.now();

        Optional<Attendance> existing = attendanceRepository.findByUser_IdAndRecordDate(user.getId(), today);
        if (existing.isPresent()) {
            throw new RuntimeException("Already checked in today.");
        }

        Attendance newAttendance = new Attendance();
        newAttendance.setUser(user);
        newAttendance.setRecordDate(today);
        newAttendance.setCheckInTime(LocalTime.now());
        newAttendance.setStatus("PRESENT");

        attendanceRepository.save(newAttendance);
        auditLogService.log("User Checked In", user);

        return getTodayStatus();
    }

    public AttendanceStatusResponse checkOut() {
        User user = getAuthenticatedUser();
        com.wap.util.PermissionUtil.validatePermission(user, "ATTENDANCE");
        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository.findByUser_IdAndRecordDate(user.getId(), today)
                .orElseThrow(() -> new RuntimeException("Must check in before checking out."));

        if (attendance.getCheckOutTime() != null) {
            throw new RuntimeException("Already checked out today.");
        }

        attendance.setCheckOutTime(LocalTime.now());
        attendanceRepository.save(attendance);
        auditLogService.log("User Checked Out", user);

        return getTodayStatus();
    }

    public void resetTodayAttendance() {
        User user = getAuthenticatedUser();
        LocalDate today = LocalDate.now();

        Optional<Attendance> attendance = attendanceRepository.findByUser_IdAndRecordDate(user.getId(), today);
        attendance.ifPresent(att -> {
            attendanceRepository.delete(att);
            attendanceRepository.flush();
            auditLogService.log("Reset Attendance Record", user);
        });
    }

    public void resetOrgAttendance(LocalDate date) {
        User user = getAuthenticatedUser();
        com.wap.util.PermissionUtil.validatePermission(user, "ATTENDANCE_OVERVIEW");
        Long orgId = user.getOrganization().getId();
        LocalDate targetDate = date != null ? date : LocalDate.now();
        if (targetDate.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot reset attendance records for future dates.");
        }

        List<Attendance> records = attendanceRepository.findByUser_Organization_IdAndRecordDate(orgId, targetDate);
        if (!records.isEmpty()) {
            attendanceRepository.deleteAll(records);
            attendanceRepository.flush();
            auditLogService.log("Reset Organization Attendance for " + targetDate, user);
        }
    }

    // Dynamic Employee Dashboard Metrics & Trends
    public EmployeeDashboardDTO getEmployeeDashboardMetrics() {
        User user = getAuthenticatedUser();
        LocalDate today = LocalDate.now();

        String status = "Not Checked In";
        AttendanceStatusResponse todayStatus = getTodayStatus();
        if ("CHECKED_IN".equals(todayStatus.getStatus())) {
            status = "Working";
        } else if ("CHECKED_OUT".equals(todayStatus.getStatus())) {
            status = "Checked Out";
        }

        // Check if on leave today
        List<LeaveRequest> allLeaves = leaveRequestRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());
        int leavesTaken = 0;

        for (LeaveRequest lr : allLeaves) {
            if ("APPROVED".equalsIgnoreCase(lr.getStatus())) {
                long days = 1;
                if (lr.getStartDate() != null && lr.getEndDate() != null) {
                    days = Math.max(1, ChronoUnit.DAYS.between(lr.getStartDate(), lr.getEndDate()) + 1);
                }
                leavesTaken += (int) days;

                if (lr.getStartDate() != null && lr.getEndDate() != null &&
                        !today.isBefore(lr.getStartDate()) && !today.isAfter(lr.getEndDate())) {
                    status = "On Leave";
                }
            }
        }

        int totalLeaveAllowance = 26;
        int balanceLeaves = Math.max(0, totalLeaveAllowance - leavesTaken);

        int month = today.getMonthValue();
        int year = today.getYear();
        int presentDays = attendanceRepository.countPresentDaysByMonthAndYear(user.getId(), month, year);

        int dayOfMonth = today.getDayOfMonth();
        int workingDaysElapsed = 0;
        for (int d = 1; d <= dayOfMonth; d++) {
            LocalDate date = LocalDate.of(year, month, d);
            if (date.getDayOfWeek().getValue() <= 5) {
                workingDaysElapsed++;
            }
        }
        if (workingDaysElapsed == 0) workingDaysElapsed = 1;

        int pct = Math.min(100, Math.max(0, (int) Math.round((double) presentDays / workingDaysElapsed * 100)));
        String attendancePercentage = pct + "%";

        // Dynamic Weekly Attendance Trend (Mon - Sun)
        Map<String, Double> weeklyAttendanceTrend = new LinkedHashMap<>();
        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("EEE", Locale.ENGLISH);
        LocalDate startOfWeek = today.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));

        for (int i = 0; i < 7; i++) {
            LocalDate d = startOfWeek.plusDays(i);
            String dayName = d.format(dayFmt);
            boolean isWeekend = d.getDayOfWeek().getValue() >= 6;

            if (d.isAfter(today)) {
                weeklyAttendanceTrend.put(dayName, 0.0);
            } else if (d.equals(today)) {
                Optional<Attendance> optAtt = attendanceRepository.findByUser_IdAndRecordDate(user.getId(), d);
                if (optAtt.isPresent()) {
                    Attendance att = optAtt.get();
                    if (att.getCheckInTime() != null && att.getCheckOutTime() != null) {
                        double mins = Duration.between(att.getCheckInTime(), att.getCheckOutTime()).toMinutes();
                        double hrs = Math.max(1.0, Math.round((mins / 60.0) * 10.0) / 10.0);
                        weeklyAttendanceTrend.put(dayName, hrs);
                    } else if (att.getCheckInTime() != null) {
                        double mins = Duration.between(att.getCheckInTime(), LocalTime.now()).toMinutes();
                        double hrs = Math.max(1.0, Math.min(9.0, Math.round((mins / 60.0) * 10.0) / 10.0));
                        weeklyAttendanceTrend.put(dayName, hrs);
                    } else {
                        weeklyAttendanceTrend.put(dayName, 8.0);
                    }
                } else {
                    weeklyAttendanceTrend.put(dayName, 0.0);
                }
            } else {
                // Past days of the week
                if (isWeekend) {
                    weeklyAttendanceTrend.put(dayName, 0.0);
                } else {
                    Optional<Attendance> optAtt = attendanceRepository.findByUser_IdAndRecordDate(user.getId(), d);
                    if (optAtt.isPresent()) {
                        Attendance att = optAtt.get();
                        if (att.getCheckInTime() != null && att.getCheckOutTime() != null) {
                            double mins = Duration.between(att.getCheckInTime(), att.getCheckOutTime()).toMinutes();
                            weeklyAttendanceTrend.put(dayName, Math.max(1.0, Math.round((mins / 60.0) * 10.0) / 10.0));
                        } else {
                            weeklyAttendanceTrend.put(dayName, 8.0);
                        }
                    } else {
                        weeklyAttendanceTrend.put(dayName, 8.0);
                    }
                }
            }
        }

        // Dynamic Monthly Attendance Trend (Week 1 to Week 5)
        Map<String, Double> monthlyAttendanceTrend = new LinkedHashMap<>();
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
                    Optional<Attendance> optAtt = attendanceRepository.findByUser_IdAndRecordDate(user.getId(), date);
                    if (optAtt.isPresent()) {
                        Attendance att = optAtt.get();
                        if (att.getCheckInTime() != null && att.getCheckOutTime() != null) {
                            double mins = Duration.between(att.getCheckInTime(), att.getCheckOutTime()).toMinutes();
                            weekHoursSum += Math.max(1.0, mins / 60.0);
                        } else if (att.getCheckInTime() != null) {
                            double mins = Duration.between(att.getCheckInTime(), LocalTime.now()).toMinutes();
                            weekHoursSum += Math.max(1.0, mins / 60.0);
                        } else {
                            weekHoursSum += 8.0;
                        }
                        daysWithAttendance++;
                    } else if (date.getDayOfWeek().getValue() <= 5 && date.isBefore(today)) {
                        weekHoursSum += 8.0;
                        daysWithAttendance++;
                    }
                }
            }
            double avgDailyHours = daysWithAttendance > 0 ? Math.round((weekHoursSum / daysWithAttendance) * 10.0) / 10.0 : (w == 1 ? 8.0 : 0.0);
            monthlyAttendanceTrend.put("Week " + w, avgDailyHours);
        }

        return new EmployeeDashboardDTO(attendancePercentage, leavesTaken, balanceLeaves, status, weeklyAttendanceTrend, monthlyAttendanceTrend);
    }

    // Employee: Get full detailed attendance logs by month and year
    public List<Map<String, Object>> getMyAttendanceHistory(Integer month, Integer year) {
        User user = getAuthenticatedUser();
        LocalDate now = LocalDate.now();
        int targetMonth = month != null && month >= 1 && month <= 12 ? month : now.getMonthValue();
        int targetYear = year != null && year >= 2020 && year <= 2030 ? year : now.getYear();

        LocalDate startDate = LocalDate.of(targetYear, targetMonth, 1);
        int daysInMonth = YearMonth.of(targetYear, targetMonth).lengthOfMonth();
        LocalDate endDate = LocalDate.of(targetYear, targetMonth, daysInMonth);

        List<Attendance> records = attendanceRepository.findByUser_IdAndRecordDateBetween(user.getId(), startDate, endDate);
        Map<LocalDate, Attendance> recordMap = records.stream()
                .collect(Collectors.toMap(Attendance::getRecordDate, a -> a, (k1, k2) -> k1));

        List<LeaveRequest> userLeaves = leaveRequestRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());

        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("hh:mm a");
        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("EEE", Locale.ENGLISH);

        List<Map<String, Object>> result = new ArrayList<>();
        for (int day = 1; day <= daysInMonth; day++) {
            LocalDate date = LocalDate.of(targetYear, targetMonth, day);
            String dayName = date.format(dayFmt);
            boolean isWeekend = date.getDayOfWeek().getValue() >= 6;

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", day);
            item.put("date", date.toString());
            item.put("dayName", dayName);

            if (recordMap.containsKey(date)) {
                Attendance att = recordMap.get(date);
                String punchIn = att.getCheckInTime() != null ? att.getCheckInTime().format(timeFmt) : "--";
                String punchOut = att.getCheckOutTime() != null ? att.getCheckOutTime().format(timeFmt) : "--";
                String duration = "--";
                if (att.getCheckInTime() != null && att.getCheckOutTime() != null) {
                    long mins = Duration.between(att.getCheckInTime(), att.getCheckOutTime()).toMinutes();
                    duration = (mins / 60) + "h " + (mins % 60) + "m";
                } else if (att.getCheckInTime() != null && date.equals(now)) {
                    long mins = Duration.between(att.getCheckInTime(), LocalTime.now()).toMinutes();
                    duration = (mins / 60) + "h " + (mins % 60) + "m";
                }

                item.put("punchIn", punchIn);
                item.put("punchOut", punchOut);
                item.put("workDuration", duration);
                item.put("status", att.getStatus() != null ? att.getStatus() : "PRESENT");
            } else {
                // Check if user was on approved leave
                boolean onLeave = userLeaves.stream().anyMatch(lr ->
                        "APPROVED".equalsIgnoreCase(lr.getStatus()) &&
                        lr.getStartDate() != null && lr.getEndDate() != null &&
                        !date.isBefore(lr.getStartDate()) && !date.isAfter(lr.getEndDate())
                );

                if (onLeave) {
                    item.put("punchIn", "--");
                    item.put("punchOut", "--");
                    item.put("workDuration", "--");
                    item.put("status", "ON_LEAVE");
                } else if (isWeekend) {
                    item.put("punchIn", "--");
                    item.put("punchOut", "--");
                    item.put("workDuration", "--");
                    item.put("status", "WEEKEND");
                } else if (date.isAfter(now)) {
                    item.put("punchIn", "--");
                    item.put("punchOut", "--");
                    item.put("workDuration", "--");
                    item.put("status", "SCHEDULED");
                } else {
                    item.put("punchIn", "--");
                    item.put("punchOut", "--");
                    item.put("workDuration", "--");
                    item.put("status", "ABSENT");
                }
            }
            result.add(item);
        }
        return result;
    }

    // HR/Admin: Get today's (or specific date's) real-time attendance feed for the organization
    public List<Map<String, Object>> getOrgTodayAttendance(LocalDate date) {
        User user = getAuthenticatedUser();
        Long orgId = user.getOrganization().getId();
        LocalDate targetDate = date != null ? date : LocalDate.now();
        if (targetDate.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot view attendance records for future dates.");
        }

        List<User> orgUsers = userRepository.findByOrganization_Id(orgId);
        List<Attendance> records = attendanceRepository.findByUser_Organization_IdAndRecordDate(orgId, targetDate);
        Map<Long, Attendance> attendanceMap = records.stream()
                .filter(a -> a.getUser() != null)
                .collect(Collectors.toMap(a -> a.getUser().getId(), a -> a, (a1, a2) -> a1));

        List<LeaveRequest> activeLeaves = leaveRequestRepository.findByUser_Organization_IdOrderByCreatedAtDesc(orgId);
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("hh:mm a");

        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : orgUsers) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getId());
            map.put("employeeId", u.getEmployeeId() != null ? u.getEmployeeId() : "EMP-0000");
            map.put("employeeName", u.getFullName());
            map.put("fullName", u.getFullName());
            map.put("department", u.getDesignation() != null ? u.getDesignation() : "General");
            map.put("date", targetDate.toString());

            if (attendanceMap.containsKey(u.getId())) {
                Attendance a = attendanceMap.get(u.getId());
                String punchIn = a.getCheckInTime() != null ? a.getCheckInTime().format(timeFmt) : "--";
                String punchOut = a.getCheckOutTime() != null ? a.getCheckOutTime().format(timeFmt) : "--";
                String duration = "--";

                if (a.getCheckInTime() != null && a.getCheckOutTime() != null) {
                    long mins = Duration.between(a.getCheckInTime(), a.getCheckOutTime()).toMinutes();
                    duration = (mins / 60) + "h " + (mins % 60) + "m";
                } else if (a.getCheckInTime() != null && targetDate.equals(LocalDate.now())) {
                    long mins = Duration.between(a.getCheckInTime(), LocalTime.now()).toMinutes();
                    duration = (mins / 60) + "h " + (mins % 60) + "m";
                }

                map.put("punchIn", punchIn);
                map.put("checkIn", punchIn);
                map.put("punchOut", punchOut);
                map.put("checkOut", punchOut);
                map.put("workDuration", duration);
                map.put("status", a.getStatus() != null ? a.getStatus() : (a.getCheckOutTime() != null ? "CHECKED_OUT" : "PRESENT"));
            } else {
                boolean onLeave = activeLeaves.stream().anyMatch(lr ->
                        lr.getUser() != null && lr.getUser().getId().equals(u.getId()) &&
                        "APPROVED".equalsIgnoreCase(lr.getStatus()) &&
                        lr.getStartDate() != null && lr.getEndDate() != null &&
                        !targetDate.isBefore(lr.getStartDate()) && !targetDate.isAfter(lr.getEndDate())
                );

                if (onLeave) {
                    map.put("punchIn", "--");
                    map.put("checkIn", "--");
                    map.put("punchOut", "--");
                    map.put("checkOut", "--");
                    map.put("workDuration", "--");
                    map.put("status", "ON_LEAVE");
                } else {
                    map.put("punchIn", "--");
                    map.put("checkIn", "--");
                    map.put("punchOut", "--");
                    map.put("checkOut", "--");
                    map.put("workDuration", "--");
                    map.put("status", "ABSENT");
                }
            }
            result.add(map);
        }
        return result;
    }
}