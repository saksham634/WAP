package com.wap.service;

import com.wap.dto.CreateProjectRequest;
import com.wap.dto.ProjectDTO;
import com.wap.dto.ProjectTeamStatsDTO;
import com.wap.dto.UserSummaryDTO;
import com.wap.entity.Project;
import com.wap.entity.User;
import com.wap.repository.AttendanceRepository;
import com.wap.repository.ProjectRepository;
import com.wap.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final AuditLogService auditLogService;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository,
                          AttendanceRepository attendanceRepository, AuditLogService auditLogService) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.attendanceRepository = attendanceRepository;
        this.auditLogService = auditLogService;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user context not found."));
    }

    @Transactional(readOnly = true)
    public List<ProjectDTO> getProjects() {
        User user = getAuthenticatedUser();
        Long orgId = user.getOrganization().getId();
        List<Project> projects = projectRepository.findByOrganization_IdOrderByDeadlineAsc(orgId);

        String roleName = user.getRole() != null ? user.getRole().getRoleName() : "ROLE_EMPLOYEE";
        if ("ROLE_EMPLOYEE".equals(roleName) || "EMPLOYEE".equals(roleName)) {
            projects = projects.stream()
                .filter(p -> p.getAssignedUsers().stream().anyMatch(u -> u.getId().equals(user.getId())))
                .collect(Collectors.toList());
        }

        return projects.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public ProjectDTO createProject(CreateProjectRequest request) {
        User user = getAuthenticatedUser();

        Project project = new Project();
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");
        project.setStatus("IN_PROGRESS");
        project.setStartDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now());
        project.setDeadline(request.getDeadline() != null ? request.getDeadline() : LocalDate.now().plusMonths(1));
        project.setProgress(request.getProgress() >= 0 ? request.getProgress() : 10);
        project.setOrganization(user.getOrganization());

        Set<User> assigned = resolveAssignedUsers(request, user.getOrganization().getId());
        project.setAssignedUsers(assigned);

        projectRepository.save(project);
        auditLogService.log("Created Project: " + project.getTitle(), user);
        return mapToDTO(project);
    }

    public ProjectDTO updateProject(Long id, CreateProjectRequest request) {
        User user = getAuthenticatedUser();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Access denied to project.");
        }

        if (request.getTitle() != null) project.setTitle(request.getTitle());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getPriority() != null) project.setPriority(request.getPriority());
        if (request.getProgress() >= 0) {
            project.setProgress(request.getProgress());
            if (request.getProgress() >= 100) {
                project.setStatus("COMPLETED");
            }
        }
        
        Set<User> assigned = resolveAssignedUsers(request, user.getOrganization().getId());
        if (!assigned.isEmpty() || (request.getAssignedUserIds() != null && request.getAssignedUserIds().isEmpty())) {
            project.setAssignedUsers(assigned);
        }

        projectRepository.save(project);
        auditLogService.log("Updated Project: " + project.getTitle(), user);
        return mapToDTO(project);
    }

    public void deleteProject(Long id) {
        User user = getAuthenticatedUser();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Access denied to project.");
        }

        String title = project.getTitle();
        projectRepository.delete(project);
        auditLogService.log("Deleted Project: " + title, user);
    }

    @Transactional(readOnly = true)
    public List<ProjectTeamStatsDTO> getTeamStats(Long id) {
        User user = getAuthenticatedUser();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (!project.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Access denied to project.");
        }
        
        int month = LocalDate.now().getMonthValue();
        int year = LocalDate.now().getYear();
        boolean isHRCaller = user.getRole() != null && "ROLE_HR".equalsIgnoreCase(user.getRole().getRoleName());
        
        return project.getAssignedUsers().stream().map(u -> {
            int presentDays = attendanceRepository.countPresentDaysByMonthAndYear(u.getId(), month, year);
            boolean isMemberAdmin = u.getRole() != null && "ROLE_ADMIN".equalsIgnoreCase(u.getRole().getRoleName());
            Double salaryToDisplay = (isHRCaller && isMemberAdmin) ? 0.0 : u.getBaseSalary();
            
            return new ProjectTeamStatsDTO(
                u.getId(),
                u.getFullName(),
                u.getDesignation(),
                u.getRole() != null ? u.getRole().getRoleName() : "ROLE_EMPLOYEE",
                salaryToDisplay,
                presentDays
            );
        }).collect(Collectors.toList());
    }

    private Set<User> resolveAssignedUsers(CreateProjectRequest request, Long orgId) {
        Set<User> result = new HashSet<>();
        List<User> orgUsers = userRepository.findByOrganization_Id(orgId);
        Map<Long, User> userById = orgUsers.stream().collect(Collectors.toMap(User::getId, u -> u, (a, b) -> a));
        Map<String, User> userByEmail = orgUsers.stream().filter(u -> u.getEmail() != null).collect(Collectors.toMap(u -> u.getEmail().toLowerCase().trim(), u -> u, (a, b) -> a));
        Map<String, User> userByName = orgUsers.stream().filter(u -> u.getFullName() != null).collect(Collectors.toMap(u -> u.getFullName().toLowerCase().trim(), u -> u, (a, b) -> a));

        if (request.getAssignedUserIds() != null) {
            for (Long uid : request.getAssignedUserIds()) {
                User u = userById.get(uid);
                if (u != null) result.add(u);
            }
        }

        if (request.getAssignedMemberEmails() != null) {
            for (String em : request.getAssignedMemberEmails()) {
                if (em == null || em.trim().isEmpty()) continue;
                String clean = em.toLowerCase().trim();
                if (userByEmail.containsKey(clean)) {
                    result.add(userByEmail.get(clean));
                } else if (userByName.containsKey(clean)) {
                    result.add(userByName.get(clean));
                }
            }
        }

        if (request.getAssignedMembers() != null && !request.getAssignedMembers().trim().isEmpty()) {
            String[] parts = request.getAssignedMembers().split(",");
            for (String p : parts) {
                if (p == null || p.trim().isEmpty()) continue;
                String clean = p.toLowerCase().trim();
                if (userByEmail.containsKey(clean)) {
                    result.add(userByEmail.get(clean));
                } else if (userByName.containsKey(clean)) {
                    result.add(userByName.get(clean));
                }
            }
        }

        return result;
    }

    private ProjectDTO mapToDTO(Project project) {
        List<UserSummaryDTO> users = project.getAssignedUsers().stream()
                .map(u -> new UserSummaryDTO(
                    u.getId(),
                    u.getFullName(),
                    u.getRole() != null ? u.getRole().getRoleName() : "ROLE_EMPLOYEE",
                    u.getDesignation(),
                    u.getEmail()
                ))
                .collect(Collectors.toList());

        return new ProjectDTO(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getStatus(),
                project.getPriority(),
                project.getStartDate(),
                project.getDeadline(),
                project.getProgress(),
                users
        );
    }
}
