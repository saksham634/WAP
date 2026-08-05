package com.wap.config;

import com.wap.entity.Organization;
import com.wap.entity.Role;
import com.wap.entity.User;
import com.wap.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final OrganizationRepository orgRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PayrollRepository payrollRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final DirectMessageRepository directMessageRepository;
    private final ProjectRepository projectRepository;
    private final AuditLogRepository auditLogRepository;

    public DataInitializer(OrganizationRepository orgRepository, RoleRepository roleRepository,
                           UserRepository userRepository, PayrollRepository payrollRepository,
                           AttendanceRepository attendanceRepository, LeaveRequestRepository leaveRequestRepository,
                           DirectMessageRepository directMessageRepository, ProjectRepository projectRepository,
                           AuditLogRepository auditLogRepository) {
        this.orgRepository = orgRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.payrollRepository = payrollRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.directMessageRepository = directMessageRepository;
        this.projectRepository = projectRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // 0. Seed initial system audit logs if empty
        if (auditLogRepository.count() == 0) {
            auditLogRepository.save(new com.wap.entity.AuditLog("System Core Services Initialized", "System Engine", "system@wap.com"));
            auditLogRepository.save(new com.wap.entity.AuditLog("Security Policies Loaded (Role-Based Access Control)", "Security Policy Manager", "security@wap.com"));
            auditLogRepository.save(new com.wap.entity.AuditLog("Workforce Portal Operational", "System Admin", "admin@workforce.com"));
        }
        // 1. Initialize or get Organization
        orgRepository.findAll().stream().findFirst().orElseGet(() -> {
            Organization newOrg = new Organization();
            newOrg.setCompanyName("Acme Innovations Inc");
            newOrg.setSupportEmail("support@workforce.com");
            newOrg.setTimezone("Asia/Kolkata (IST)");
            newOrg.setWorkHours("9:00 AM - 6:00 PM");
            return orgRepository.save(newOrg);
        });

        // 2. Initialize Default System Roles if not present
        roleRepository.findByRoleName("ROLE_ADMIN").orElseGet(() -> {
            Role r = new Role();
            r.setRoleName("ROLE_ADMIN");
            r.setDescription("System Administrator");
            r.setPermissions("ALL");
            return roleRepository.save(r);
        });

        Role hrRole = roleRepository.findByRoleName("ROLE_HR").orElseGet(() -> {
            Role r = new Role();
            r.setRoleName("ROLE_HR");
            r.setDescription("HR Manager");
            r.setPermissions("DASHBOARD,ATTENDANCE,LEAVES,PAYROLL,PERSONAL_INFO,EMPLOYEE_MGMT,ATTENDANCE_OVERVIEW,LEAVE_APPROVALS,PAYROLL_ADMIN,PROJECTS");
            return roleRepository.save(r);
        });
        if (hrRole.getPermissions() == null || !hrRole.getPermissions().contains("ATTENDANCE")) {
            hrRole.setPermissions("DASHBOARD,ATTENDANCE,LEAVES,PAYROLL,PERSONAL_INFO,EMPLOYEE_MGMT,ATTENDANCE_OVERVIEW,LEAVE_APPROVALS,PAYROLL_ADMIN,PROJECTS");
            roleRepository.save(hrRole);
        }

        roleRepository.findByRoleName("ROLE_EMPLOYEE").orElseGet(() -> {
            Role r = new Role();
            r.setRoleName("ROLE_EMPLOYEE");
            r.setDescription("Standard Employee");
            r.setPermissions("DASHBOARD,ATTENDANCE,LEAVES,PAYROLL,PROJECTS,PERSONAL_INFO");
            return roleRepository.save(r);
        });

        // 3. Automatically purge dummy / fake test accounts added in previous runs
        List<String> dummyEmails = List.of(
            "admin@workforce.com",
            "hr@workforce.com",
            "john@workforce.com",
            "jane@workforce.com"
        );

        for (String email : dummyEmails) {
            userRepository.findByEmail(email).ifPresent(user -> {
                Long userId = user.getId();
                // Unlink from projects
                List<com.wap.entity.Project> projects = projectRepository.findAll();
                for (com.wap.entity.Project p : projects) {
                    if (p.getAssignedUsers() != null && p.getAssignedUsers().remove(user)) {
                        projectRepository.save(p);
                    }
                }
                payrollRepository.deleteByUser_Id(userId);
                attendanceRepository.deleteByUser_Id(userId);
                leaveRequestRepository.deleteByUser_Id(userId);
                directMessageRepository.deleteBySender_Id(userId);
                userRepository.delete(user);
            });
        }
    }
}
