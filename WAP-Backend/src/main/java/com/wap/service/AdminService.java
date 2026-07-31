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
import java.util.Map;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.ArrayList;
import java.util.Random;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import com.wap.repository.AttendanceRepository;
import com.wap.repository.LeaveRequestRepository;
import com.wap.dto.AdminDashboardDTO;
import com.wap.dto.EditUserRequest;
import com.wap.dto.SettingsRequestDTO;
import com.wap.dto.ChangePasswordDTO;
import com.wap.dto.UserProfileDTO;
import com.wap.entity.AuditLog;
import com.wap.entity.Organization;
import com.wap.repository.AuditLogRepository;
import com.wap.repository.OrganizationRepository;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AuditLogRepository auditLogRepository;
    private final OrganizationRepository organizationRepository;

    public AdminService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder,
                        AttendanceRepository attendanceRepository, LeaveRequestRepository leaveRequestRepository,
                        AuditLogRepository auditLogRepository, OrganizationRepository organizationRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.auditLogRepository = auditLogRepository;
        this.organizationRepository = organizationRepository;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user context not found."));
    }

    public static String getDefaultPermissionsForRole(String roleName) {
        if ("ROLE_ADMIN".equals(roleName)) {
            return "ALL";
        } else if ("ROLE_HR".equals(roleName)) {
            return "EMPLOYEE_MGMT,LEAVE_APPROVALS,ATTENDANCE_OVERVIEW,PAYROLL_ADMIN,DASHBOARD";
        } else {
            return "ATTENDANCE,LEAVES,PAYROLL,PERSONAL_INFO,DASHBOARD";
        }
    }

    // Organization-Scoped: Get all users within the current user's organization
    public List<UserDTO> getAllSystemUsers() {
        User currentUser = getAuthenticatedUser();
        Long orgId = currentUser.getOrganization().getId();
        List<User> users = userRepository.findByOrganization_Id(orgId);
        
        return users.stream().map(user -> {
            String perms = user.getPermissions();
            if (perms == null || perms.trim().isEmpty()) {
                perms = getDefaultPermissionsForRole(user.getRole().getRoleName());
            }
            return new UserDTO(
                user.getId(),
                user.getEmployeeId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getRoleName(),
                user.getStatus(),
                perms,
                user.getDesignation(),
                user.getBaseSalary(),
                user.getAllowances(),
                user.getDeductions()
            );
        }).collect(Collectors.toList());
    }

    // Create a new user in the current Admin's organization
    public void addNewUser(AddUserRequest request) {
        // 1. Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered in the system.");
        }

        // 2. Identify the Admin making the request (to link the same Organization)
        User adminUser = getAuthenticatedUser();

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

    // Organization-Scoped Dashboard Metrics
    public AdminDashboardDTO getAdminDashboardMetrics() {
        User currentUser = getAuthenticatedUser();
        Long orgId = currentUser.getOrganization().getId();

        long totalEmployees = userRepository.countByOrganization_Id(orgId);
        LocalDate today = LocalDate.now();
        long presentToday = attendanceRepository.countPresentByOrganization_IdAndDate(orgId, today);
        long pendingLeaves = leaveRequestRepository.countByUser_Organization_IdAndStatus(orgId, "PENDING");
        long onLeave = leaveRequestRepository.countActiveLeavesByOrganization_IdAndDate(orgId, today);

        // 1. Role Distribution
        Map<String, Long> roleDistribution = new HashMap<>();
        List<User> users = userRepository.findByOrganization_Id(orgId);
        for (User u : users) {
            String r = u.getRole().getRoleName();
            roleDistribution.put(r, roleDistribution.getOrDefault(r, 0L) + 1L);
        }

        // 2. Weekly Attendance Trend (Last 7 Days)
        Map<String, Long> weeklyAttendanceTrend = new LinkedHashMap<>();
        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("EEE", Locale.ENGLISH);
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            String dayName = d.format(dayFormatter);
            long count = attendanceRepository.countPresentByOrganization_IdAndDate(orgId, d);
            weeklyAttendanceTrend.put(dayName, count);
        }

        // 3. Dynamic Real-Time Operational & System Alerts
        List<Map<String, String>> systemAlerts = new ArrayList<>();

        if (pendingLeaves > 0) {
            Map<String, String> alert = new HashMap<>();
            alert.put("icon", "fa-solid fa-clock");
            alert.put("type", "warning");
            alert.put("title", "Pending Leave Requests");
            alert.put("description", pendingLeaves + " leave application(s) awaiting approval.");
            systemAlerts.add(alert);
        }

        long notCheckedIn = totalEmployees - presentToday - onLeave;
        if (notCheckedIn > 0) {
            Map<String, String> alert = new HashMap<>();
            alert.put("icon", "fa-solid fa-user-clock");
            alert.put("type", "info");
            alert.put("title", "Daily Check-in Status");
            alert.put("description", notCheckedIn + " employee(s) have not checked in yet today.");
            systemAlerts.add(alert);
        } else {
            Map<String, String> alert = new HashMap<>();
            alert.put("icon", "fa-solid fa-circle-check");
            alert.put("type", "info");
            alert.put("title", "Workforce Attendance");
            alert.put("description", "All active employees accounted for today.");
            systemAlerts.add(alert);
        }

        // Add Recent System Activity Audit Logs
        List<AuditLog> recentLogs = auditLogRepository.findTop5ByOrderByTimestampDesc();
        for (AuditLog log : recentLogs) {
            Map<String, String> alert = new HashMap<>();
            alert.put("icon", "fa-solid fa-shield-halved");
            alert.put("type", "primary");
            alert.put("title", log.getAction());
            alert.put("description", "By " + log.getPerformedBy() + " (" + log.getUserEmail() + ")");
            systemAlerts.add(alert);
            if (systemAlerts.size() >= 5) break;
        }

        return new AdminDashboardDTO(totalEmployees, presentToday, pendingLeaves, onLeave, roleDistribution, weeklyAttendanceTrend, systemAlerts);
    }

    public void deleteUser(String employeeId) {
        User currentUser = getAuthenticatedUser();
        User user = userRepository.findByEmployeeIdAndOrganization_Id(employeeId, currentUser.getOrganization().getId())
                .orElseThrow(() -> new RuntimeException("User not found with Employee ID: " + employeeId + " in your organization."));
        userRepository.delete(user);
    }

    public void updateUser(String employeeId, EditUserRequest request) {
        User currentUser = getAuthenticatedUser();
        User user = userRepository.findByEmployeeIdAndOrganization_Id(employeeId, currentUser.getOrganization().getId())
                .orElseThrow(() -> new RuntimeException("User not found with Employee ID: " + employeeId + " in your organization."));
        
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }
        
        userRepository.save(user);
    }

    public Map<String, String> getSettings() {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User adminUser = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin context not found."));

        Organization org = adminUser.getOrganization();
        Map<String, String> settings = new HashMap<>();
        if (org != null) {
            settings.put("companyName", org.getCompanyName());
            settings.put("timezone", org.getTimezone());
        }
        return settings;
    }

    public Map<String, Object> getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Map<String, Object> userData = new HashMap<>();
        userData.put("fullName", user.getFullName());
        userData.put("email", user.getEmail());
        userData.put("employeeId", user.getEmployeeId());
        userData.put("role", user.getRole().getRoleName());
        userData.put("profilePicture", user.getProfilePicture());
        userData.put("phone", user.getPhoneNumber());
        userData.put("department", user.getDesignation());
        userData.put("addressStreet", user.getAddressStreet());
        userData.put("addressCityState", user.getAddressCityState());
        userData.put("addressZip", user.getAddressZip());
        userData.put("emergencyName", user.getEmergencyName());
        userData.put("emergencyRelation", user.getEmergencyRelation());
        userData.put("emergencyPhone", user.getEmergencyPhone());
        String perms = user.getPermissions();
        if (perms == null || perms.trim().isEmpty()) {
            perms = getDefaultPermissionsForRole(user.getRole().getRoleName());
        }
        userData.put("permissions", perms);
        return userData;
    }

    public String getUserPermissions(String employeeId) {
        User currentUser = getAuthenticatedUser();
        User user = userRepository.findByEmployeeIdAndOrganization_Id(employeeId, currentUser.getOrganization().getId())
                .orElseThrow(() -> new RuntimeException("User not found with Employee ID: " + employeeId + " in your organization."));
        String perms = user.getPermissions();
        if (perms == null || perms.trim().isEmpty()) {
            perms = getDefaultPermissionsForRole(user.getRole().getRoleName());
        }
        return perms;
    }

    public void updateUserPermissions(String employeeId, List<String> permissionsList) {
        User currentUser = getAuthenticatedUser();
        User user = userRepository.findByEmployeeIdAndOrganization_Id(employeeId, currentUser.getOrganization().getId())
                .orElseThrow(() -> new RuntimeException("User not found with Employee ID: " + employeeId + " in your organization."));
        
        String permissionsStr = String.join(",", permissionsList);
        user.setPermissions(permissionsStr);
        userRepository.save(user);

        auditLogRepository.save(new AuditLog("Updated permissions for user " + employeeId + " (" + user.getFullName() + ")", "Admin", currentUser.getEmail()));
    }

    public void updateSettings(SettingsRequestDTO request) {
        // Find the admin user to get their organization
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User adminUser = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin context not found."));

        Organization org = adminUser.getOrganization();
        if (org != null) {
            if (request.getCompanyName() != null) org.setCompanyName(request.getCompanyName());
            if (request.getTimezone() != null) org.setTimezone(request.getTimezone());
            organizationRepository.save(org);
            
            auditLogRepository.save(new AuditLog("Updated System Settings", adminUser.getFullName(), adminUser.getEmail()));
        }
    }

    public void updateProfile(String email, UserProfileDTO request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null && !request.getFullName().isEmpty()) {
            user.setFullName(request.getFullName());
        }
        if (request.getProfilePicture() != null) {
            user.setProfilePicture(request.getProfilePicture());
        }
        if (request.getPhone() != null) user.setPhoneNumber(request.getPhone());
        if (request.getAddressStreet() != null) user.setAddressStreet(request.getAddressStreet());
        if (request.getAddressCityState() != null) user.setAddressCityState(request.getAddressCityState());
        if (request.getAddressZip() != null) user.setAddressZip(request.getAddressZip());
        if (request.getEmergencyName() != null) user.setEmergencyName(request.getEmergencyName());
        if (request.getEmergencyRelation() != null) user.setEmergencyRelation(request.getEmergencyRelation());
        if (request.getEmergencyPhone() != null) user.setEmergencyPhone(request.getEmergencyPhone());
        userRepository.save(user);
        auditLogRepository.save(new AuditLog("Updated Personal Profile", user.getFullName(), user.getEmail()));
    }

    public void changePassword(String email, ChangePasswordDTO request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        auditLogRepository.save(new AuditLog("Changed Password", user.getFullName(), user.getEmail()));
    }

    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }

    public void updateDesignation(String employeeId, String designation) {
        User user = userRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("User not found: " + employeeId));
        user.setDesignation(designation);
        userRepository.save(user);
        
        User admin = getAuthenticatedUser();
        auditLogRepository.save(new AuditLog("Updated Designation", user.getFullName() + " → " + designation, admin.getEmail()));
    }

    public void updateSalaryStructure(String employeeId, Double baseSalary, Double allowances, Double deductions) {
        User user = userRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("User not found: " + employeeId));
        user.setBaseSalary(baseSalary);
        user.setAllowances(allowances);
        user.setDeductions(deductions);
        userRepository.save(user);
        
        User admin = getAuthenticatedUser();
        auditLogRepository.save(new AuditLog("Updated Salary Structure", user.getFullName() + " (Base: " + baseSalary + ", Allow: " + allowances + ", Ded: " + deductions + ")", admin.getEmail()));
    }
}