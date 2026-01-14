package com.hust.auraflow.service.impl;

import com.hust.auraflow.dto.request.CreateTaskRequest;
import com.hust.auraflow.dto.request.UpdateTaskRequest;
import com.hust.auraflow.dto.response.TaskResponse;
import com.hust.auraflow.entity.Project;
import com.hust.auraflow.entity.Task;
import com.hust.auraflow.entity.TaskPriority;
import com.hust.auraflow.entity.User;
import com.hust.auraflow.entity.Workflow;
import com.hust.auraflow.repository.ProjectRepository;
import com.hust.auraflow.repository.TaskRepository;
import com.hust.auraflow.repository.UserRepository;
import com.hust.auraflow.repository.WorkflowRepository;
import com.hust.auraflow.security.UserPrincipal;
import com.hust.auraflow.service.TaskService;
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
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final WorkflowRepository workflowRepository;
    private final UserRepository userRepository;

    @Override
    public Page<TaskResponse> getTasks(UserPrincipal principal, Long projectId, String title, String status,
            TaskPriority priority, Pageable pageable) {
        Long tenantId = principal.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("User does not have a tenant");
        }

        return taskRepository.findByTenantIdAndFilters(tenantId, projectId, title, status, priority, pageable)
                .map(this::toTaskResponse);
    }

    @Override
    public TaskResponse getTaskById(UserPrincipal principal, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        validateTenantAccess(principal, task);
        return toTaskResponse(task);
    }

    @Override
    @Transactional
    public TaskResponse createTask(UserPrincipal principal, CreateTaskRequest request) {
        Long tenantId = principal.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("User does not have a tenant");
        }

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        if (!project.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Project not accessible");
        }

        Workflow workflow = workflowRepository.findById(request.getWorkflowId())
                .orElseThrow(() -> new IllegalArgumentException("Workflow not found"));
        // Assuming Workflow also has Tenant check, but Workflow entity details not
        // strictly checked here.
        // Assuming workflow belongs to same tenant.

        User creator = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Task task = new Task();
        task.setTenant(project.getTenant());
        task.setProject(project);
        task.setWorkflow(workflow);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        // Status? Default to first step? Or Request?
        // Task entity has "status" string.
        task.setStatus("OPEN"); // Default status
        task.setCreator(creator);
        task.setBeginDate(request.getBeginDate());
        task.setEndDate(request.getEndDate());
        task.setCreatedAt(Instant.now());
        task.setUpdatedAt(Instant.now());

        task = taskRepository.save(task);
        log.info("Created task: {} by user {}", task.getId(), principal.getUserId());

        return toTaskResponse(task);
    }

    @Override
    @Transactional
    public TaskResponse updateTask(UserPrincipal principal, Long taskId, UpdateTaskRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        validateTenantAccess(principal, task);

        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getBeginDate() != null) {
            task.setBeginDate(request.getBeginDate());
        }
        if (request.getEndDate() != null) {
            task.setEndDate(request.getEndDate());
        }

        task.setUpdatedAt(Instant.now());
        task = taskRepository.save(task);
        log.info("Updated task: {} by user {}", task.getId(), principal.getUserId());

        return toTaskResponse(task);
    }

    @Override
    @Transactional
    public void deleteTask(UserPrincipal principal, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        validateTenantAccess(principal, task);

        taskRepository.delete(task);
        log.info("Deleted task: {} by user {}", taskId, principal.getUserId());
    }

    private void validateTenantAccess(UserPrincipal principal, Task task) {
        Long tenantId = principal.getTenantId();
        if (tenantId == null || !task.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Task not accessible");
        }
    }

    private TaskResponse toTaskResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .projectId(task.getProject() != null ? task.getProject().getId() : null)
                .projectName(task.getProject() != null ? task.getProject().getName() : null)
                .workflowId(task.getWorkflow() != null ? task.getWorkflow().getId() : null)
                .workflowName(task.getWorkflow() != null ? task.getWorkflow().getName() : null)
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .currentStepId(task.getCurrentStep() != null ? task.getCurrentStep().getId() : null)
                .currentStepName(task.getCurrentStep() != null ? task.getCurrentStep().getName() : null)
                .creatorId(task.getCreator() != null ? task.getCreator().getId() : null)
                .creatorName(task.getCreator() != null
                        ? (task.getCreator().getFirstName() + " " + task.getCreator().getLastName()).trim()
                        : null)
                .beginDate(task.getBeginDate())
                .endDate(task.getEndDate())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
