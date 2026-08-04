package com.wap.controller;

import com.wap.dto.ApiResponse;
import com.wap.dto.CreateProjectRequest;
import com.wap.dto.ProjectDTO;
import com.wap.dto.ProjectTeamStatsDTO;
import com.wap.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@Tag(name = "Project Allocation & Team Tracking", description = "Endpoints for managing organization projects, assigning employees, and tracking progress")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @Operation(summary = "Get all projects for authenticated user's organization")
    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getProjects() {
        return ResponseEntity.ok(projectService.getProjects());
    }

    @Operation(summary = "Get projects assigned to authenticated employee")
    @GetMapping("/my")
    public ResponseEntity<List<ProjectDTO>> getMyProjects() {
        return ResponseEntity.ok(projectService.getProjects());
    }

    @Operation(summary = "Create a new project and assign team members")
    @PostMapping
    public ResponseEntity<ProjectDTO> createProject(@Valid @RequestBody CreateProjectRequest request) {
        return ResponseEntity.ok(projectService.createProject(request));
    }

    @Operation(summary = "Update an existing project details")
    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTO> updateProject(@PathVariable Long id, @Valid @RequestBody CreateProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    @Operation(summary = "Delete a project by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(ApiResponse.success("Project deleted successfully", Map.of("message", "Project deleted successfully")));
    }

    @Operation(summary = "Get team stats for a specific project")
    @GetMapping("/{id}/team-stats")
    public ResponseEntity<List<ProjectTeamStatsDTO>> getTeamStats(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getTeamStats(id));
    }
}
