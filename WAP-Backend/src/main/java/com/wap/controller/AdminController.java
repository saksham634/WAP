package com.wap.controller;

import com.wap.dto.AddUserRequest;
import com.wap.dto.UserDTO;
import com.wap.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*") 
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
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
}