package com.hust.auraflow.service.impl;

import com.hust.auraflow.common.enums.ProjectStatus;
import com.hust.auraflow.dto.request.CreateProjectRequest;
import com.hust.auraflow.dto.request.UpdateProjectRequest;
import com.hust.auraflow.dto.response.ProjectResponse;
import com.hust.auraflow.entity.Department;
import com.hust.auraflow.entity.Project;
import com.hust.auraflow.entity.Tenant;
import com.hust.auraflow.entity.User;
import com.hust.auraflow.repository.DepartmentRepository;
import com.hust.auraflow.repository.ProjectRepository;
import com.hust.auraflow.repository.TenantRepository;
import com.hust.auraflow.repository.UserRepository;
import com.hust.auraflow.security.UserPrincipal;
import com.hust.auraflow.service.ProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;

    @Override
    public Page<ProjectResponse> getProjects(
            UserPrincipal principal,
            Long departmentId,
            String name,
            String status,
            Pageable pageable) {
        Long tenantId = principal.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("User does not have a tenant");
        }

        return projectRepository.findByTenantIdAndFilters(tenantId, departmentId, name, status, pageable)
                .map(this::toProjectResponse);
    }

    @Override
    public ProjectResponse getProjectById(UserPrincipal principal, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        validateTenantAccess(principal, project);
        return toProjectResponse(project);
    }

    @Override
    @Transactional
    public ProjectResponse createProject(UserPrincipal principal, CreateProjectRequest request) {
        Long tenantId = principal.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("User does not have a tenant");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        if (!department.getTenantId().equals(tenantId)) {
            throw new IllegalArgumentException("Department does not belong to tenant");
        }

        User creator = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Tenant tenant = tenantRepository.findById(creator.getId()).orElseThrow(RuntimeException::new);

        Project project = new Project();
        project.setTenant(tenant);
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setDepartment(department);
        project.setCreatedBy(creator);
        project.setStatus(ProjectStatus.DRAFT);
        project.setBeginDate(request.getBeginDate());
        project.setEndDate(request.getEndDate());
        project.setCreatedAt(Instant.now());
        project.setUpdatedAt(Instant.now());

        project = projectRepository.save(project);
        log.info("Created project: {} by user {}", project.getId(), principal.getUserId());

        return toProjectResponse(project);
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(UserPrincipal principal, Long projectId, UpdateProjectRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        validateTenantAccess(principal, project);

        if (request.getName() != null) {
            project.setName(request.getName());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
        if (request.getBeginDate() != null) {
            project.setBeginDate(request.getBeginDate());
        }
        if (request.getEndDate() != null) {
            project.setEndDate(request.getEndDate());
        }

        project.setUpdatedBy(principal.getUserId());
        project.setUpdatedAt(Instant.now());

        project = projectRepository.save(project);
        log.info("Updated project: {} by user {}", project.getId(), principal.getUserId());

        return toProjectResponse(project);
    }

    @Override
    @Transactional
    public void deleteProject(UserPrincipal principal, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        validateTenantAccess(principal, project);
        projectRepository.delete(project);
        log.info("Deleted project: {} by user {}", projectId, principal.getUserId());
    }

    private void validateTenantAccess(UserPrincipal principal, Project project) {
        Long tenantId = principal.getTenantId();
        if (!project.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Project not accessible");
        }
    }

    private ProjectResponse toProjectResponse(Project project) {
        Department department = project.getDepartment();
        User createdBy = project.getCreatedBy();

        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .departmentId(department != null ? department.getId() : null)
                .departmentName(department != null ? department.getName() : null)
                .divisionId(department != null && department.getDivision() != null ? department.getDivision().getId()
                        : null)
                .divisionName(
                        department != null && department.getDivision() != null ? department.getDivision().getName()
                                : null)
                .createdById(createdBy != null ? createdBy.getId() : null)
                .createdByName(
                        createdBy != null ? (createdBy.getFirstName() + " " + createdBy.getLastName()).trim() : null)
                .beginDate(project.getBeginDate())
                .endDate(project.getEndDate())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
