package com.wap.service;

import com.wap.dto.AuthResponse;
import com.wap.dto.LoginRequest;
import com.wap.dto.RegisterOrgRequest;
import com.wap.entity.Organization;
import com.wap.entity.RefreshToken;
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
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final OrganizationRepository orgRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager,
                       CustomUserDetailsService userDetailsService,
                       JwtUtil jwtUtil,
                       RefreshTokenService refreshTokenService,
                       UserRepository userRepository,
                       OrganizationRepository orgRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
        this.orgRepository = orgRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse login(LoginRequest request) {
        // Authenticate the user credentials
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // Fetch User and generate JWT Access Token
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String accessToken = jwtUtil.generateToken(userDetails);
        
        // Generate Rotating Refresh Token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(request.getEmail());
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + request.getEmail()));
        
        return AuthResponse.builder()
                .token(accessToken) // backward compatibility
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getAccessTokenExpirationMs())
                .role(user.getRole().getRoleName())
                .employeeId(user.getEmployeeId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .message("Login successful")
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(String requestRefreshToken) {
        if (requestRefreshToken == null || requestRefreshToken.trim().isEmpty()) {
            throw new IllegalArgumentException("Refresh token is required.");
        }

        // Rotate Refresh Token
        RefreshToken newRefreshToken = refreshTokenService.rotateRefreshToken(requestRefreshToken);
        User user = newRefreshToken.getUser();

        // Generate a fresh Access Token
        String newAccessToken = jwtUtil.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(newAccessToken)
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getAccessTokenExpirationMs())
                .role(user.getRole().getRoleName())
                .employeeId(user.getEmployeeId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .message("Token refreshed successfully")
                .build();
    }

    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.trim().isEmpty()) {
            refreshTokenService.revokeToken(refreshToken);
        }
    }

    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public AuthResponse registerOrganization(RegisterOrgRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use.");
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
        adminUser.setEmployeeId("ADMIN-" + System.currentTimeMillis());
        adminUser.setFullName(request.getAdminName());
        adminUser.setEmail(request.getEmail());
        adminUser.setPhoneNumber(request.getPhone());
        adminUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        adminUser.setStatus("ACTIVE");
        
        userRepository.save(adminUser);

        return AuthResponse.builder()
                .token(null)
                .role("ROLE_ADMIN")
                .employeeId(adminUser.getEmployeeId())
                .fullName(adminUser.getFullName())
                .email(adminUser.getEmail())
                .message("Organization created successfully. Please login.")
                .build();
    }

    public com.wap.dto.UserProfileDTO getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
        return new com.wap.dto.UserProfileDTO(
                user.getFullName(),
                user.getProfilePicture(),
                user.getEmployeeId(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole().getRoleName().replace("ROLE_", ""),
                user.getDesignation(),
                user.getAddressStreet(),
                user.getAddressCityState(),
                user.getAddressZip(),
                user.getEmergencyName(),
                user.getEmergencyRelation(),
                user.getEmergencyPhone()
        );
    }
}