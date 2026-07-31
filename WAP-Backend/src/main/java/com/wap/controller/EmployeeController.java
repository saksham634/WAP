package com.wap.controller;

import com.wap.dto.EmployeeDashboardDTO;
import com.wap.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employee")
@CrossOrigin(origins = "*")
public class EmployeeController {

    private final AttendanceService attendanceService;
    private final com.wap.repository.UserRepository userRepository;

    public EmployeeController(AttendanceService attendanceService, com.wap.repository.UserRepository userRepository) {
        this.attendanceService = attendanceService;
        this.userRepository = userRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<EmployeeDashboardDTO> getDashboardMetrics() {
        return ResponseEntity.ok(attendanceService.getEmployeeDashboardMetrics());
    }

    @GetMapping("/profile")
    public ResponseEntity<com.wap.dto.UserDTO> getProfile() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        com.wap.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        com.wap.dto.UserDTO dto = new com.wap.dto.UserDTO(
            user.getId(),
            user.getEmployeeId(),
            user.getFullName(),
            user.getEmail(),
            user.getRole().getRoleName(),
            user.getStatus(),
            user.getPermissions(),
            user.getDesignation(),
            user.getBaseSalary(),
            user.getAllowances(),
            user.getDeductions()
        );
        return ResponseEntity.ok(dto);
    }
}
