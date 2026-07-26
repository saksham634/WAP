package com.wap.service;

import com.wap.dto.AddUserRequest;
import com.wap.dto.UserDTO;
import com.wap.entity.Role;
import com.wap.entity.User;
import com.wap.repository.RoleRepository;
import com.wap.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Existing method: Get all users
    public List<UserDTO> getAllSystemUsers() {
        List<User> users = userRepository.findAll();
        
        return users.stream().map(user -> new UserDTO(
                user.getEmployeeId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getRoleName(),
                user.getStatus()
        )).collect(Collectors.toList());
    }

    // NEW method: Create a new user
    public void addNewUser(AddUserRequest request) {
        // 1. Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered in the system.");
        }

        // 2. Identify the Admin making the request (to link the same Organization)
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User adminUser = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin context not found."));

        // 3. Find the assigned role
        Role assignedRole = roleRepository.findByRoleName(request.getRole())
                .orElseThrow(() -> new RuntimeException("Invalid role specified."));

        // 4. Generate a unique 6-digit Employee ID
        String newEmployeeId = "EMP-" + (100000 + new Random().nextInt(900000));

        // 5. Create and save the new user
        User newUser = new User();
        newUser.setFullName(request.getFullName());
        newUser.setEmail(request.getEmail());
        newUser.setPhoneNumber(request.getPhone());
        newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        newUser.setRole(assignedRole);
        newUser.setOrganization(adminUser.getOrganization()); // Inherit the organization ID from the Admin
        newUser.setEmployeeId(newEmployeeId);
        newUser.setStatus("ACTIVE");

        userRepository.save(newUser);
    }
}