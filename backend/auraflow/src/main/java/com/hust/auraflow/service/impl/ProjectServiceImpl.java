package com.hust.auraflow.service.impl;

import com.hust.auraflow.common.enums.ProjectStatus;
import com.hust.auraflow.dto.request.AddProjectMemberRequest;
import com.hust.auraflow.dto.request.CreateProjectRequest;
import com.hust.auraflow.dto.request.UpdateProjectRequest;
import com.hust.auraflow.dto.response.ProjectMemberResponse;
import com.hust.auraflow.dto.response.ProjectResponse;
import com.hust.auraflow.dto.response.UserResponse;
import com.hust.auraflow.entity.Department;
import com.hust.auraflow.entity.Project;
import com.hust.auraflow.entity.ProjectMember;
import com.hust.auraflow.entity.User;
import com.hust.auraflow.repository.DepartmentRepository;
import com.hust.auraflow.repository.ProjectMemberRepository;
import com.hust.auraflow.repository.ProjectRepository;
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
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

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

        Project project = new Project();
        project.setTenant(creator.getTenant());
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

        // Delete all project members first
        projectMemberRepository.deleteByProjectId(projectId);

        projectRepository.delete(project);
        log.info("Deleted project: {} by user {}", projectId, principal.getUserId());
    }

    @Override
    public Page<ProjectMemberResponse> getProjectMembers(UserPrincipal principal, Long projectId, Pageable pageable) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        validateTenantAccess(principal, project);

        return projectMemberRepository.findByProjectId(projectId, pageable)
                .map(this::toProjectMemberResponse);
    }

    @Override
    @Transactional
    public ProjectMemberResponse addProjectMember(UserPrincipal principal, Long projectId,
            AddProjectMemberRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        validateTenantAccess(principal, project);

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, request.getUserId())) {
            throw new IllegalArgumentException("User is already a member of this project");
        }

        ProjectMember member = new ProjectMember();
        member.setProject(project);
        member.setUser(user);
        member.setCreatedAt(Instant.now());
        member.setUpdatedAt(Instant.now());

        member = projectMemberRepository.save(member);
        log.info("Added member {} to project {} by user {}", request.getUserId(), projectId, principal.getUserId());

        return toProjectMemberResponse(member);
    }

    @Override
    @Transactional
    public void removeProjectMember(UserPrincipal principal, Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        validateTenantAccess(principal, project);

        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        projectMemberRepository.delete(member);
        log.info("Removed member {} from project {} by user {}", userId, projectId, principal.getUserId());
    }

    @Override
    public Page<UserResponse> getAvailableUsersForProject(
            UserPrincipal principal,
            Long projectId,
            String search,
            Pageable pageable) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        validateTenantAccess(principal, project);

        Long departmentId = project.getDepartment() != null ? project.getDepartment().getId() : null;

        // Get existing member user IDs
        List<Long> existingMemberIds = projectMemberRepository.findByProjectId(projectId)
                .stream()
                .map(m -> m.getUser().getId())
                .toList();

        // Find users in the same department who are not already members
        return userRepository.findByDepartmentIdAndIdNotIn(departmentId, existingMemberIds, search, pageable)
                .map(this::toUserResponse);
    }

    private void validateTenantAccess(UserPrincipal principal, Project project) {
        Long tenantId = principal.getTenantId();
        if (tenantId == null || !project.getTenant().getId().equals(tenantId)) {
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

    private ProjectMemberResponse toProjectMemberResponse(ProjectMember member) {
        User user = member.getUser();
        return ProjectMemberResponse.builder()
                .id(member.getId())
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .title(user.getTitle())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(member.getCreatedAt())
                .build();
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .title(user.getTitle())
                .avatarUrl(user.getAvatarUrl())
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .build();
    }
}
