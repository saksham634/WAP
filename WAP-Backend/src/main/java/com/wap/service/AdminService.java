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
import java.util.Arrays;
import java.util.Random;
import java.util.Optional;
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
import com.wap.repository.PayrollRepository;
import com.wap.repository.DirectMessageRepository;
import com.wap.repository.ProjectRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AuditLogRepository auditLogRepository;
    private final OrganizationRepository organizationRepository;
    private final PayrollRepository payrollRepository;
    private final DirectMessageRepository directMessageRepository;
    private final ProjectRepository projectRepository;
    private final com.wap.repository.RefreshTokenRepository refreshTokenRepository;

    public AdminService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder,
                        AttendanceRepository attendanceRepository, LeaveRequestRepository leaveRequestRepository,
                        AuditLogRepository auditLogRepository, OrganizationRepository organizationRepository,
                        PayrollRepository payrollRepository, DirectMessageRepository directMessageRepository,
                        ProjectRepository projectRepository,
                        com.wap.repository.RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.auditLogRepository = auditLogRepository;
        this.organizationRepository = organizationRepository;
        this.payrollRepository = payrollRepository;
        this.directMessageRepository = directMessageRepository;
        this.projectRepository = projectRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user context not found."));
    }

    public static String getDefaultPermissionsForRole(String roleName) {
        if ("ROLE_ADMIN".equals(roleName)) {
            return "ALL";
        }
        if ("ROLE_HR".equalsIgnoreCase(roleName) || "HR".equalsIgnoreCase(roleName)) {
            return "DASHBOARD,ATTENDANCE,LEAVES,PAYROLL,PERSONAL_INFO,EMPLOYEE_MGMT,ATTENDANCE_OVERVIEW,LEAVE_APPROVALS,PAYROLL_ADMIN,PROJECTS";
        } else {
            return "DASHBOARD,ATTENDANCE,LEAVES,PAYROLL,PROJECTS,PERSONAL_INFO";
        }
    }

    public String resolveUserPermissions(User user) {
        if (user == null) return "DASHBOARD";
        if (user.getRole() != null && "ROLE_ADMIN".equals(user.getRole().getRoleName())) {
            return "ALL";
        }
        String perms = user.getPermissions();
        if (perms != null && !perms.trim().isEmpty()) {
            return perms;
        }
        if (user.getRole() != null && user.getRole().getPermissions() != null && !user.getRole().getPermissions().trim().isEmpty()) {
            return user.getRole().getPermissions();
        }
        return getDefaultPermissionsForRole(user.getRole() != null ? user.getRole().getRoleName() : "");
    }

    // Organization-Scoped: Get all users within the current user's organization
    public List<UserDTO> getAllSystemUsers() {
        User currentUser = getAuthenticatedUser();
        Long orgId = currentUser.getOrganization().getId();
        boolean isHRCaller = currentUser.getRole() != null && "ROLE_HR".equalsIgnoreCase(currentUser.getRole().getRoleName());
        List<User> users = userRepository.findByOrganization_Id(orgId);
        
        return users.stream().map(user -> {
            String perms = resolveUserPermissions(user);
            boolean isTargetAdmin = user.getRole() != null && "ROLE_ADMIN".equalsIgnoreCase(user.getRole().getRoleName());
            Double baseSalary = (isHRCaller && isTargetAdmin) ? 0.0 : (user.getBaseSalary() != null ? user.getBaseSalary() : 0.0);
            Double allowances = (isHRCaller && isTargetAdmin) ? 0.0 : (user.getAllowances() != null ? user.getAllowances() : 0.0);
            Double deductions = (isHRCaller && isTargetAdmin) ? 0.0 : (user.getDeductions() != null ? user.getDeductions() : 0.0);

            return new UserDTO(
                user.getId(),
                user.getEmployeeId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().getRoleName() : "ROLE_EMPLOYEE",
                user.getStatus(),
                perms,
                user.getDesignation(),
                user.getPhoneNumber(),
                user.getProfilePicture(),
                baseSalary,
                allowances,
                deductions
            );
        }).collect(Collectors.toList());
    }

    // Helper: Find user by numeric DB id or Employee ID string
    public User findUserByIdOrEmployeeId(String idOrEmployeeId, Long orgId) {
        if (idOrEmployeeId == null || idOrEmployeeId.trim().isEmpty()) {
            throw new RuntimeException("User identifier is required.");
        }
        String idStr = idOrEmployeeId.trim();

        // 1. Try finding by employee ID in this organization
        Optional<User> byEmpId = userRepository.findByEmployeeIdAndOrganization_Id(idStr, orgId);
        if (byEmpId.isPresent()) {
            return byEmpId.get();
        }

        // 2. Try finding by numeric database ID
        try {
            Long numericId = Long.parseLong(idStr);
            Optional<User> byId = userRepository.findById(numericId);
            if (byId.isPresent() && byId.get().getOrganization().getId().equals(orgId)) {
                return byId.get();
            }
        } catch (NumberFormatException ignored) {}

        // 3. Fallback: Global employee ID lookup
        Optional<User> byEmpGlobal = userRepository.findByEmployeeId(idStr);
        if (byEmpGlobal.isPresent()) {
            return byEmpGlobal.get();
        }

        // 4. Fallback: Email lookup
        Optional<User> byEmail = userRepository.findByEmail(idStr);
        if (byEmail.isPresent()) {
            return byEmail.get();
        }

        throw new RuntimeException("User not found with identifier: " + idOrEmployeeId);
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
                .orElseThrow(() -> new RuntimeException("Invalid role specified: " + request.getRole()));

        // 4. Generate a unique 6-digit Employee ID if not provided
        String newEmployeeId = (request.getEmployeeId() != null && !request.getEmployeeId().trim().isEmpty())
                ? request.getEmployeeId().trim()
                : "EMP-" + (100000 + new Random().nextInt(900000));

        // 5. Create and save the new user
        User newUser = new User();
        newUser.setFullName(request.getFullName());
        newUser.setEmail(request.getEmail());
        newUser.setPhoneNumber(request.getPhone());
        newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        newUser.setRole(assignedRole);
        newUser.setOrganization(adminUser.getOrganization()); // Inherit the organization ID from the Admin
        newUser.setEmployeeId(newEmployeeId);
        newUser.setDesignation(request.getDepartment() != null ? request.getDepartment() : "General");
        newUser.setBaseSalary(request.getBaseSalary() != null ? request.getBaseSalary() : 60000.0);
        newUser.setAllowances(request.getAllowances() != null ? request.getAllowances() : 15000.0);
        newUser.setDeductions(request.getDeductions() != null ? request.getDeductions() : 5000.0);
        newUser.setStatus("ACTIVE");

        userRepository.save(newUser);
        auditLogRepository.save(new AuditLog("Created User Account: " + newUser.getFullName() + " (" + newEmployeeId + ")", adminUser.getFullName(), adminUser.getEmail()));
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
            String r = (u.getRole() != null && u.getRole().getRoleName() != null) ? u.getRole().getRoleName() : "ROLE_EMPLOYEE";
            roleDistribution.put(r, roleDistribution.getOrDefault(r, 0L) + 1L);
        }

        // 2. Weekly Attendance Trend (Current Calendar Week: Mon - Sun)
        Map<String, Long> weeklyAttendanceTrend = new LinkedHashMap<>();
        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("EEE", Locale.ENGLISH);
        LocalDate startOfWeek = today.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        for (int i = 0; i < 7; i++) {
            LocalDate d = startOfWeek.plusDays(i);
            String dayName = d.format(dayFormatter);
            long count = d.isAfter(today) ? 0L : attendanceRepository.countPresentByOrganization_IdAndDate(orgId, d);
            weeklyAttendanceTrend.put(dayName, count);
        }

        // Monthly Attendance Trend (Current Calendar Month: Week 1 to Week 5)
        Map<String, Long> monthlyAttendanceTrend = new LinkedHashMap<>();
        int daysInMonth = today.lengthOfMonth();
        int totalWeeks = (int) Math.ceil((double) daysInMonth / 7.0);
        for (int w = 1; w <= totalWeeks; w++) {
            int startDay = (w - 1) * 7 + 1;
            int endDay = Math.min(w * 7, daysInMonth);
            long weekPresentSum = 0L;
            int daysCounted = 0;
            for (int d = startDay; d <= endDay; d++) {
                LocalDate date = today.withDayOfMonth(d);
                if (!date.isAfter(today)) {
                    weekPresentSum += attendanceRepository.countPresentByOrganization_IdAndDate(orgId, date);
                    daysCounted++;
                }
            }
            long avgDailyPresent = daysCounted > 0 ? Math.round((double) weekPresentSum / daysCounted) : 0L;
            monthlyAttendanceTrend.put("Week " + w, avgDailyPresent);
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

        return new AdminDashboardDTO(totalEmployees, presentToday, pendingLeaves, onLeave, roleDistribution, weeklyAttendanceTrend, monthlyAttendanceTrend, systemAlerts);
    }

    @Transactional
    public void deleteUser(String idOrEmployeeId) {
        User currentUser = getAuthenticatedUser();
        User user = findUserByIdOrEmployeeId(idOrEmployeeId, currentUser.getOrganization().getId());
        
        if (user.getId().equals(currentUser.getId())) {
            throw new RuntimeException("You cannot delete your own account.");
        }
        
        String name = user.getFullName();
        String empId = user.getEmployeeId();
        Long userId = user.getId();

        // 1. Unlink user from all organization projects
        List<com.wap.entity.Project> projects = projectRepository.findByOrganization_IdOrderByDeadlineAsc(currentUser.getOrganization().getId());
        for (com.wap.entity.Project p : projects) {
            if (p.getAssignedUsers() != null && p.getAssignedUsers().remove(user)) {
                projectRepository.save(p);
            }
        }

        // 2. Cascade delete dependent child records
        refreshTokenRepository.deleteByUser_Id(userId);
        payrollRepository.deleteByUser_Id(userId);
        attendanceRepository.deleteByUser_Id(userId);
        leaveRequestRepository.deleteByUser_Id(userId);
        directMessageRepository.deleteBySender_Id(userId);

        // 3. Delete user account
        userRepository.delete(user);
        auditLogRepository.save(new AuditLog("Deleted User Account: " + name + " (" + empId + ")", currentUser.getFullName(), currentUser.getEmail()));
    }

    public void updateUser(String idOrEmployeeId, EditUserRequest request) {
        User currentUser = getAuthenticatedUser();
        User user = findUserByIdOrEmployeeId(idOrEmployeeId, currentUser.getOrganization().getId());
        
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            user.setEmail(request.getEmail().trim());
        }

        boolean isHRCaller = currentUser.getRole() != null && "ROLE_HR".equalsIgnoreCase(currentUser.getRole().getRoleName());
        boolean isTargetAdmin = user.getRole() != null && "ROLE_ADMIN".equalsIgnoreCase(user.getRole().getRoleName());

        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            if (isHRCaller && isTargetAdmin && !request.getRole().equalsIgnoreCase("ROLE_ADMIN")) {
                throw new RuntimeException("HR managers cannot change Administrator roles.");
            }
            Role role = roleRepository.findByRoleName(request.getRole().trim().toUpperCase())
                    .orElse(null);
            if (role != null) {
                user.setRole(role);
            }
        }
        if (request.getDesignation() != null && !request.getDesignation().trim().isEmpty()) {
            user.setDesignation(request.getDesignation().trim());
        } else if (request.getDepartment() != null && !request.getDepartment().trim().isEmpty()) {
            user.setDesignation(request.getDepartment().trim());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            user.setStatus(request.getStatus().trim().toUpperCase());
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        } else if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            user.setPhoneNumber(request.getPhone().trim());
        }
        
        // HR cannot update Admin salary
        if (!(isHRCaller && isTargetAdmin)) {
            if (request.getBaseSalary() != null) {
                user.setBaseSalary(request.getBaseSalary());
            }
            if (request.getAllowances() != null) {
                user.setAllowances(request.getAllowances());
            }
            if (request.getDeductions() != null) {
                user.setDeductions(request.getDeductions());
            }
        }
        
        userRepository.save(user);
        auditLogRepository.save(new AuditLog("Updated User Profile: " + user.getFullName() + " (" + user.getEmployeeId() + ")", currentUser.getFullName(), currentUser.getEmail()));
    }


    public Map<String, Object> getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("fullName", user.getFullName());
        userData.put("email", user.getEmail());
        userData.put("employeeId", user.getEmployeeId());
        userData.put("role", user.getRole() != null ? user.getRole().getRoleName() : "ROLE_EMPLOYEE");
        userData.put("profilePicture", user.getProfilePicture());
        userData.put("phone", user.getPhoneNumber());
        userData.put("phoneNumber", user.getPhoneNumber());
        userData.put("department", user.getDesignation());
        userData.put("designation", user.getDesignation());
        userData.put("address", user.getAddressStreet());
        userData.put("addressStreet", user.getAddressStreet());
        userData.put("addressCityState", user.getAddressCityState());
        userData.put("addressZip", user.getAddressZip());
        userData.put("emergencyName", user.getEmergencyName());
        userData.put("emergencyContactName", user.getEmergencyName());
        userData.put("emergencyRelation", user.getEmergencyRelation());
        userData.put("emergencyPhone", user.getEmergencyPhone());
        userData.put("emergencyContactPhone", user.getEmergencyPhone());
        userData.put("baseSalary", user.getBaseSalary() != null ? user.getBaseSalary() : 0.0);
        userData.put("allowances", user.getAllowances() != null ? user.getAllowances() : 0.0);
        userData.put("deductions", user.getDeductions() != null ? user.getDeductions() : 0.0);
        userData.put("permissions", resolveUserPermissions(user));
        return userData;
    }

    public Map<String, List<String>> getRolePermissions() {
        Map<String, List<String>> map = new HashMap<>();
        
        Role hrRole = roleRepository.findByRoleName("ROLE_HR").orElse(null);
        String hrPerms = (hrRole != null && hrRole.getPermissions() != null && !hrRole.getPermissions().trim().isEmpty())
                ? hrRole.getPermissions()
                : "DASHBOARD,EMPLOYEE_MGMT,ATTENDANCE_OVERVIEW,LEAVE_APPROVALS,PAYROLL_ADMIN,PROJECTS";
        map.put("ROLE_HR", Arrays.stream(hrPerms.split(",")).map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList()));
        
        Role empRole = roleRepository.findByRoleName("ROLE_EMPLOYEE").orElse(null);
        String empPerms = (empRole != null && empRole.getPermissions() != null && !empRole.getPermissions().trim().isEmpty())
                ? empRole.getPermissions()
                : "DASHBOARD,ATTENDANCE,LEAVES,PAYROLL,PROJECTS,PERSONAL_INFO";
        map.put("ROLE_EMPLOYEE", Arrays.stream(empPerms.split(",")).map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList()));
        
        return map;
    }

    public void updateRolePermissions(Map<String, List<String>> payload) {
        User admin = getAuthenticatedUser();
        
        for (Map.Entry<String, List<String>> entry : payload.entrySet()) {
            String roleName = entry.getKey();
            List<String> perms = entry.getValue();
            if (perms != null) {
                String permsStr = String.join(",", perms);
                Role role = roleRepository.findByRoleName(roleName)
                        .orElseGet(() -> {
                            Role r = new Role();
                            r.setRoleName(roleName);
                            return r;
                        });
                role.setPermissions(permsStr);
                roleRepository.save(role);
            }
        }
        
        auditLogRepository.save(new AuditLog("Updated Security Roles & Permissions Matrix", admin.getFullName(), admin.getEmail()));
    }

    public String getUserPermissions(String idOrEmployeeId) {
        User currentUser = getAuthenticatedUser();
        User user = findUserByIdOrEmployeeId(idOrEmployeeId, currentUser.getOrganization().getId());
        return resolveUserPermissions(user);
    }

    public void updateUserPermissions(String idOrEmployeeId, List<String> permissionsList) {
        User currentUser = getAuthenticatedUser();
        User user = findUserByIdOrEmployeeId(idOrEmployeeId, currentUser.getOrganization().getId());
        
        String permissionsStr = String.join(",", permissionsList);
        user.setPermissions(permissionsStr);
        userRepository.save(user);

        auditLogRepository.save(new AuditLog("Updated permissions for user " + user.getEmployeeId() + " (" + user.getFullName() + ")", "Admin", currentUser.getEmail()));
    }

    public Map<String, Object> getSettings() {
        User adminUser = getAuthenticatedUser();
        Organization org = adminUser.getOrganization();
        Map<String, Object> settings = new HashMap<>();
        if (org != null) {
            settings.put("companyName", org.getCompanyName() != null ? org.getCompanyName() : "Acme Innovations Inc");
            settings.put("timezone", org.getTimezone() != null ? org.getTimezone() : "Asia/Kolkata (IST)");
            settings.put("supportEmail", org.getSupportEmail() != null ? org.getSupportEmail() : "support@workforce.com");
            settings.put("workHours", org.getWorkHours() != null ? org.getWorkHours() : "9:00 AM - 6:00 PM");
            settings.put("autoPunchOut", true);
        }
        return settings;
    }

    public void updateSettings(SettingsRequestDTO request) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User adminUser = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin context not found."));

        Organization org = adminUser.getOrganization();
        if (org != null) {
            if (request.getCompanyName() != null && !request.getCompanyName().trim().isEmpty()) {
                org.setCompanyName(request.getCompanyName().trim());
            }
            if (request.getTimezone() != null && !request.getTimezone().trim().isEmpty()) {
                org.setTimezone(request.getTimezone().trim());
            }
            if (request.getWorkHours() != null && !request.getWorkHours().trim().isEmpty()) {
                org.setWorkHours(request.getWorkHours().trim());
            }
            organizationRepository.save(org);
            
            auditLogRepository.save(new AuditLog("Updated System Settings (" + org.getCompanyName() + ")", adminUser.getFullName(), adminUser.getEmail()));
        }
    }

    public void updateProfile(String email, UserProfileDTO request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        if (request.getFullName() != null && !request.getFullName().isEmpty()) {
            user.setFullName(request.getFullName());
        }
        if (request.getProfilePicture() != null) {
            user.setProfilePicture(request.getProfilePicture());
        }
        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            user.setPhoneNumber(request.getPhone());
        }
        
        if (request.getAddressStreet() != null) {
            user.setAddressStreet(request.getAddressStreet());
        } else if (request.getAddress() != null) {
            user.setAddressStreet(request.getAddress());
        }
        
        if (request.getAddressCityState() != null) user.setAddressCityState(request.getAddressCityState());
        if (request.getAddressZip() != null) user.setAddressZip(request.getAddressZip());
        
        if (request.getEmergencyName() != null) {
            user.setEmergencyName(request.getEmergencyName());
        } else if (request.getEmergencyContactName() != null) {
            user.setEmergencyName(request.getEmergencyContactName());
        }
        
        if (request.getEmergencyRelation() != null) user.setEmergencyRelation(request.getEmergencyRelation());
        
        if (request.getEmergencyPhone() != null) {
            user.setEmergencyPhone(request.getEmergencyPhone());
        } else if (request.getEmergencyContactPhone() != null) {
            user.setEmergencyPhone(request.getEmergencyContactPhone());
        }

        userRepository.save(user);
        auditLogRepository.save(new AuditLog("Updated Personal Profile", user.getFullName(), user.getEmail()));
    }

    public void changePassword(String email, ChangePasswordDTO request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        if (request.getCurrentPassword() == null || request.getNewPassword() == null) {
            throw new RuntimeException("Current and new password are required.");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        auditLogRepository.save(new AuditLog("Changed Password", user.getFullName(), user.getEmail()));
    }

    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }

    public void updateDesignation(String idOrEmployeeId, String designation) {
        User admin = getAuthenticatedUser();
        User user = findUserByIdOrEmployeeId(idOrEmployeeId, admin.getOrganization().getId());
        user.setDesignation(designation);
        userRepository.save(user);
        
        auditLogRepository.save(new AuditLog("Updated Designation", user.getFullName() + " → " + designation, admin.getEmail()));
    }

    public void updateSalaryStructure(String idOrEmployeeId, Double baseSalary, Double allowances, Double deductions) {
        User admin = getAuthenticatedUser();
        boolean isHRCaller = admin.getRole() != null && "ROLE_HR".equalsIgnoreCase(admin.getRole().getRoleName());
        User user = findUserByIdOrEmployeeId(idOrEmployeeId, admin.getOrganization().getId());

        if (isHRCaller && user.getRole() != null && "ROLE_ADMIN".equalsIgnoreCase(user.getRole().getRoleName())) {
            throw new RuntimeException("HR managers are not permitted to modify Administrator salary structure.");
        }

        if (baseSalary != null) user.setBaseSalary(baseSalary);
        if (allowances != null) user.setAllowances(allowances);
        if (deductions != null) user.setDeductions(deductions);
        userRepository.save(user);
        
        auditLogRepository.save(new AuditLog("Updated Salary Structure", user.getFullName() + " (Base: " + user.getBaseSalary() + ", Allow: " + user.getAllowances() + ", Ded: " + user.getDeductions() + ")", admin.getEmail()));
    }
}