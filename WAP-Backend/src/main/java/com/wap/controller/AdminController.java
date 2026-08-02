package com.wap.controller;

import com.wap.dto.AddUserRequest;
import com.wap.dto.UserDTO;
import com.wap.dto.EditUserRequest;
import com.wap.dto.SettingsRequestDTO;
import com.wap.dto.ChangePasswordDTO;
import com.wap.dto.UserProfileDTO;
import com.wap.service.AdminService;
import com.wap.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*") 
public class AdminController {

    private final AdminService adminService;
    private final JwtUtil jwtUtil;

    public AdminController(AdminService adminService, JwtUtil jwtUtil) {
        this.adminService = adminService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = adminService.getAllSystemUsers();
        return ResponseEntity.ok(users);
    }

    // NEW ENDPOINT: Add a user
    @PostMapping("/users")
    public ResponseEntity<?> addUser(@RequestBody AddUserRequest request) {
        try {
            adminService.addNewUser(request);
            return ResponseEntity.ok(Map.of("message", "User created successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<com.wap.dto.AdminDashboardDTO> getDashboardMetrics() {
        return ResponseEntity.ok(adminService.getAdminDashboardMetrics());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        try {
            adminService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody EditUserRequest request) {
        try {
            adminService.updateUser(id, request);
            return ResponseEntity.ok(Map.of("message", "User updated successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users/{id}/permissions")
    public ResponseEntity<?> getUserPermissions(@PathVariable String id) {
        try {
            String perms = adminService.getUserPermissions(id);
            return ResponseEntity.ok(Map.of("employeeId", id, "permissions", perms));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/permissions")
    public ResponseEntity<?> updateUserPermissions(@PathVariable String id, @RequestBody Map<String, List<String>> payload) {
        try {
            List<String> permissions = payload.get("permissions");
            adminService.updateUserPermissions(id, permissions != null ? permissions : List.of());
            return ResponseEntity.ok(Map.of("message", "Permissions updated successfully for user " + id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/roles/permissions")
    public ResponseEntity<?> getRolePermissions() {
        try {
            return ResponseEntity.ok(adminService.getRolePermissions());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/roles/permissions")
    public ResponseEntity<?> updateRolePermissions(@RequestBody Map<String, List<String>> payload) {
        try {
            adminService.updateRolePermissions(payload);
            return ResponseEntity.ok(Map.of("message", "Role permissions updated successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        try {
            return ResponseEntity.ok(adminService.getSettings());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @RequestMapping(value = "/settings", method = {RequestMethod.POST, RequestMethod.PUT})
    public ResponseEntity<?> updateSettings(@RequestBody SettingsRequestDTO request) {
        try {
            adminService.updateSettings(request);
            return ResponseEntity.ok(Map.of("message", "Settings updated successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.substring(7));
            return ResponseEntity.ok(adminService.getCurrentUser(email));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/users/me/profile")
    public ResponseEntity<?> updateProfile(@RequestHeader("Authorization") String token, @RequestBody UserProfileDTO request) {
        try {
            String email = jwtUtil.extractUsername(token.substring(7));
            adminService.updateProfile(email, request);
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/users/me/password")
    public ResponseEntity<?> changePassword(@RequestHeader("Authorization") String token, @RequestBody ChangePasswordDTO request) {
        try {
            String email = jwtUtil.extractUsername(token.substring(7));
            adminService.changePassword(email, request);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/audit")
    public ResponseEntity<?> getAuditLogs() {
        return ResponseEntity.ok(adminService.getAuditLogs());
    }

    @PutMapping("/users/{id}/designation")
    public ResponseEntity<?> updateDesignation(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try {
            String designation = payload.get("designation");
            adminService.updateDesignation(id, designation);
            return ResponseEntity.ok(Map.of("message", "Designation updated successfully for " + id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/salary")
    public ResponseEntity<?> updateSalaryStructure(@PathVariable String id, @RequestBody Map<String, Double> payload) {
        try {
            Double baseSalary = payload.get("baseSalary");
            Double allowances = payload.get("allowances");
            Double deductions = payload.get("deductions");
            
            if (baseSalary == null || allowances == null || deductions == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "baseSalary, allowances, and deductions are required"));
            }
            
            adminService.updateSalaryStructure(id, baseSalary, allowances, deductions);
            return ResponseEntity.ok(Map.of("message", "Salary structure updated successfully for " + id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}