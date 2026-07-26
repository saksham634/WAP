package com.wap.service;

import com.wap.dto.AuthResponse;
import com.wap.dto.LoginRequest;
import com.wap.dto.RegisterOrgRequest;
import com.wap.entity.Organization;
import com.wap.entity.Role;
import com.wap.entity.User;
import com.wap.repository.OrganizationRepository;
import com.wap.repository.RoleRepository;
import com.wap.repository.UserRepository;
import com.wap.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final OrganizationRepository orgRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager, CustomUserDetailsService userDetailsService,
                       JwtUtil jwtUtil, UserRepository userRepository, OrganizationRepository orgRepository,
                       RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.orgRepository = orgRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse login(LoginRequest request) {
        // Authenticate the user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // Fetch User and generate JWT
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        
        return new AuthResponse(token, user.getRole().getRoleName(), "Login successful");
    }

    public AuthResponse registerOrganization(RegisterOrgRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use.");
        }

        // 1. Create Organization
        Organization org = new Organization();
        org.setCompanyName(request.getCompanyName());
        org.setSupportEmail(request.getEmail());
        org = orgRepository.save(org);

        // 2. Fetch or Create ADMIN Role
        Role adminRole = roleRepository.findByRoleName("ROLE_ADMIN")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setRoleName("ROLE_ADMIN");
                    newRole.setDescription("System Administrator");
                    return roleRepository.save(newRole);
                });

        // 3. Create Admin User
        User adminUser = new User();
        adminUser.setOrganization(org);
        adminUser.setRole(adminRole);
        adminUser.setEmployeeId("ADMIN-" + System.currentTimeMillis()); // Generate a unique ID
        adminUser.setFullName(request.getAdminName());
        adminUser.setEmail(request.getEmail());
        adminUser.setPhoneNumber(request.getPhone());
        adminUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        adminUser.setStatus("ACTIVE");
        
        userRepository.save(adminUser);

        return new AuthResponse(null, "ROLE_ADMIN", "Organization created successfully. Please login.");
    }
}