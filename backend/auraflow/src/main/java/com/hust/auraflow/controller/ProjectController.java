package com.hust.auraflow.controller;

import com.hust.auraflow.dto.request.CreateProjectRequest;
import com.hust.auraflow.dto.request.UpdateProjectRequest;
import com.hust.auraflow.dto.response.ProjectResponse;
import com.hust.auraflow.security.UserPrincipal;
import com.hust.auraflow.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<Page<ProjectResponse>> getProjects(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return ResponseEntity.ok(projectService.getProjects(principal, departmentId, name, status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(principal, id));
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateProjectRequest request) {
        return ResponseEntity.ok(projectService.createProject(principal, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(principal, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        projectService.deleteProject(principal, id);
        return ResponseEntity.noContent().build();
    }

}
