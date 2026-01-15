package com.hust.auraflow.service;

import com.hust.auraflow.dto.request.CreateProjectRequest;
import com.hust.auraflow.dto.request.UpdateProjectRequest;
import com.hust.auraflow.dto.response.ProjectResponse;
import com.hust.auraflow.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProjectService {
    Page<ProjectResponse> getProjects(UserPrincipal principal, Long departmentId, String name, String status,
            Pageable pageable);

    ProjectResponse getProjectById(UserPrincipal principal, Long projectId);

    ProjectResponse createProject(UserPrincipal principal, CreateProjectRequest request);

    ProjectResponse updateProject(UserPrincipal principal, Long projectId, UpdateProjectRequest request);

    void deleteProject(UserPrincipal principal, Long projectId);
}
