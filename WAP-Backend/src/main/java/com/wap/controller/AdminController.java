package com.wap.controller;

import com.wap.dto.*;
import com.wap.service.AdminService;
import com.wap.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Operations & User Management", description = "Endpoints for managing organization users, roles, permissions, settings, and audit logs")
public class AdminController {

    private final AdminService adminService;
    private final JwtUtil jwtUtil;

    public AdminController(AdminService adminService, JwtUtil jwtUtil) {
        this.adminService = adminService;
        this.jwtUtil = jwtUtil;
    }

    @Operation(summary = "Get all users within the organization")
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = adminService.getAllSystemUsers();
        return ResponseEntity.ok(users);
    }

    @Operation(summary = "Add a new user to the organization")
    @PostMapping("/users")
    public ResponseEntity<?> addUser(@Valid @RequestBody AddUserRequest request) {
        adminService.addNewUser(request);
        return ResponseEntity.ok(ApiResponse.success("User created successfully!", Map.of("message", "User created successfully!")));
    }

    @Operation(summary = "Get real-time admin dashboard metrics")
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDTO> getDashboardMetrics() {
        return ResponseEntity.ok(adminService.getAdminDashboardMetrics());
    }

    @Operation(summary = "Delete a user account and cascade clean related records")
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully!", Map.of("message", "User deleted successfully!")));
    }

    @Operation(summary = "Update user details")
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody EditUserRequest request) {
        adminService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully!", Map.of("message", "User updated successfully!")));
    }

    @Operation(summary = "Get specific user's custom permissions")
    @GetMapping("/users/{id}/permissions")
    public ResponseEntity<?> getUserPermissions(@PathVariable String id) {
        String perms = adminService.getUserPermissions(id);
        return ResponseEntity.ok(Map.of("employeeId", id, "permissions", perms));
    }

    @Operation(summary = "Update specific user's custom permissions")
    @PutMapping("/users/{id}/permissions")
    public ResponseEntity<?> updateUserPermissions(@PathVariable String id, @RequestBody Map<String, List<String>> payload) {
        List<String> permissions = payload.get("permissions");
        adminService.updateUserPermissions(id, permissions != null ? permissions : List.of());
        return ResponseEntity.ok(ApiResponse.success("Permissions updated successfully for user " + id, Map.of("message", "Permissions updated successfully for user " + id)));
    }

    @Operation(summary = "Get role-level permission mappings")
    @GetMapping("/roles/permissions")
    public ResponseEntity<?> getRolePermissions() {
        return ResponseEntity.ok(adminService.getRolePermissions());
    }

    @Operation(summary = "Update role-level permission mappings")
    @PutMapping("/roles/permissions")
    public ResponseEntity<?> updateRolePermissions(@RequestBody Map<String, List<String>> payload) {
        adminService.updateRolePermissions(payload);
        return ResponseEntity.ok(ApiResponse.success("Role permissions updated successfully.", Map.of("message", "Role permissions updated successfully.")));
    }

    @Operation(summary = "Get organization settings")
    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        return ResponseEntity.ok(adminService.getSettings());
    }

    @Operation(summary = "Update organization settings")
    @RequestMapping(value = "/settings", method = {RequestMethod.POST, RequestMethod.PUT})
    public ResponseEntity<?> updateSettings(@Valid @RequestBody SettingsRequestDTO request) {
        adminService.updateSettings(request);
        return ResponseEntity.ok(ApiResponse.success("Settings updated successfully!", Map.of("message", "Settings updated successfully!")));
    }

    @Operation(summary = "Get authenticated user profile")
    @GetMapping("/users/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractUsername(token.substring(7));
        return ResponseEntity.ok(adminService.getCurrentUser(email));
    }

    @Operation(summary = "Update personal profile of logged-in user")
    @PutMapping("/users/me/profile")
    public ResponseEntity<?> updateProfile(@RequestHeader("Authorization") String token, @RequestBody UserProfileDTO request) {
        String email = jwtUtil.extractUsername(token.substring(7));
        adminService.updateProfile(email, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully!", Map.of("message", "Profile updated successfully!")));
    }

    @Operation(summary = "Remove personal profile picture")
    @DeleteMapping("/users/me/profile/picture")
    public ResponseEntity<?> deleteProfilePicture(@RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractUsername(token.substring(7));
        adminService.deleteProfilePicture(email);
        return ResponseEntity.ok(ApiResponse.success("Profile picture removed successfully!", Map.of("message", "Profile picture removed successfully!")));
    }

    @Operation(summary = "Change password for logged-in user")
    @PutMapping("/users/me/password")
    public ResponseEntity<?> changePassword(@RequestHeader("Authorization") String token, @Valid @RequestBody ChangePasswordDTO request) {
        String email = jwtUtil.extractUsername(token.substring(7));
        adminService.changePassword(email, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully!", Map.of("message", "Password changed successfully!")));
    }

    @Operation(summary = "Get top 50 recent system audit logs")
    @GetMapping({"/audit", "/audit-logs"})
    public ResponseEntity<?> getAuditLogs() {
        return ResponseEntity.ok(adminService.getAuditLogs());
    }

    @Operation(summary = "Update user designation")
    @PutMapping("/users/{id}/designation")
    public ResponseEntity<?> updateDesignation(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String designation = payload.get("designation");
        adminService.updateDesignation(id, designation);
        return ResponseEntity.ok(ApiResponse.success("Designation updated successfully for " + id, Map.of("message", "Designation updated successfully for " + id)));
    }

    @Operation(summary = "Update user salary structure")
    @PutMapping("/users/{id}/salary")
    public ResponseEntity<?> updateSalaryStructure(@PathVariable String id, @RequestBody Map<String, Double> payload) {
        Double baseSalary = payload.get("baseSalary");
        Double allowances = payload.get("allowances");
        Double deductions = payload.get("deductions");
        
        if (baseSalary == null || allowances == null || deductions == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "baseSalary, allowances, and deductions are required"));
        }
        
        adminService.updateSalaryStructure(id, baseSalary, allowances, deductions);
        return ResponseEntity.ok(ApiResponse.success("Salary structure updated successfully for " + id, Map.of("message", "Salary structure updated successfully for " + id)));
    }
}