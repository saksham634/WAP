package com.wap.service;

import com.wap.dto.AttendanceStatusResponse;
import com.wap.entity.Attendance;
import com.wap.entity.User;
import com.wap.repository.AttendanceRepository;
import com.wap.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, UserRepository userRepository) {
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
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
}