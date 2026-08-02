package com.wap.service;

import com.wap.dto.CreateProjectRequest;
import com.wap.dto.ProjectDTO;
import com.wap.entity.Organization;
import com.wap.entity.Project;
import com.wap.entity.User;
import com.wap.repository.ProjectRepository;
import com.wap.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final com.wap.repository.AttendanceRepository attendanceRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository, com.wap.repository.AttendanceRepository attendanceRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.attendanceRepository = attendanceRepository;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user context not found."));
    }

    public List<ProjectDTO> getProjects() {
        User user = getAuthenticatedUser();
        Long orgId = user.getOrganization().getId();
        List<Project> projects = projectRepository.findByOrganization_IdOrderByDeadlineAsc(orgId);

        String roleName = user.getRole().getRoleName();
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

        if (request.getAssignedUserIds() != null && !request.getAssignedUserIds().isEmpty()) {
            java.util.List<User> users = userRepository.findAllById(request.getAssignedUserIds());
            project.setAssignedUsers(new java.util.HashSet<>(users));
        }

        projectRepository.save(project);
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
        if (request.getAssignedUserIds() != null) {
            java.util.List<User> users = userRepository.findAllById(request.getAssignedUserIds());
            project.setAssignedUsers(new java.util.HashSet<>(users));
        }

        projectRepository.save(project);
        return mapToDTO(project);
    }

    public void deleteProject(Long id) {
        User user = getAuthenticatedUser();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Access denied to project.");
        }

        projectRepository.delete(project);
    }

    public List<com.wap.dto.ProjectTeamStatsDTO> getTeamStats(Long id) {
        User user = getAuthenticatedUser();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (!project.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Access denied to project.");
        }
        
        int month = LocalDate.now().getMonthValue();
        int year = LocalDate.now().getYear();
        
        return project.getAssignedUsers().stream().map(u -> {
            int presentDays = attendanceRepository.countPresentDaysByMonthAndYear(u.getId(), month, year);
            return new com.wap.dto.ProjectTeamStatsDTO(
                u.getId(),
                u.getFullName(),
                u.getDesignation(),
                u.getRole().getRoleName(),
                u.getBaseSalary(),
                presentDays
            );
        }).collect(Collectors.toList());
    }

    private ProjectDTO mapToDTO(Project project) {
        java.util.List<com.wap.dto.UserSummaryDTO> users = project.getAssignedUsers().stream()
                .map(u -> new com.wap.dto.UserSummaryDTO(u.getId(), u.getFullName(), u.getRole().getRoleName(), u.getDesignation(), u.getEmail()))
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
