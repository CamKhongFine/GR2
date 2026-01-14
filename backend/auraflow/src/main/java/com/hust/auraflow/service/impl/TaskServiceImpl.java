package com.hust.auraflow.service.impl;

import com.hust.auraflow.common.enums.ProjectStatus;
import com.hust.auraflow.common.enums.TaskStatus;
import com.hust.auraflow.dto.request.CreateTaskRequest;
import com.hust.auraflow.dto.request.UpdateTaskRequest;
import com.hust.auraflow.dto.response.TaskResponse;
import com.hust.auraflow.entity.*;
import com.hust.auraflow.repository.*;
import com.hust.auraflow.security.UserPrincipal;
import com.hust.auraflow.service.TaskService;
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
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final WorkflowRepository workflowRepository;
    private final UserRepository userRepository;
    private final WorkflowStepRepository workflowStepRepository;
    private final StepTaskRepository stepTaskRepository;

    @Override
    public Page<TaskResponse> getTasks(UserPrincipal principal, Long projectId, String title, String status,
            String priority, Pageable pageable) {
        Long tenantId = principal.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("User does not have a tenant");
        }

        return taskRepository.findByTenantIdAndFilters(tenantId, projectId, title, status, priority, pageable)
                .map(this::toTaskResponse);
    }

    @Override
    @Transactional(readOnly = true)
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

        User creator = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Get workflow steps ordered by step order
        List<WorkflowStep> steps = workflowStepRepository.findByWorkflowIdOrderByStepOrder(request.getWorkflowId());
        if (steps.isEmpty()) {
            throw new IllegalArgumentException("Workflow has no steps");
        }

        // Find START step and first business step
        WorkflowStep startStep = steps.stream()
                .filter(s -> "START".equals(s.getStepType()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Workflow has no START step"));

        WorkflowStep firstBusinessStep = steps.stream()
                .filter(s -> !"START".equals(s.getStepType()) && !"END".equals(s.getStepType()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Workflow has no business steps"));

        // Create task with status RUNNING and currentStep = first business step
        Task task = new Task();
        task.setTenant(project.getTenant());
        task.setProject(project);
        task.setWorkflow(workflow);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setStatus(TaskStatus.RUNNING);
        task.setCreator(creator);
        task.setCurrentStep(firstBusinessStep);
        task.setBeginDate(request.getBeginDate());
        task.setEndDate(request.getEndDate());
        task.setCreatedAt(Instant.now());
        task.setUpdatedAt(Instant.now());

        task = taskRepository.save(task);
        log.info("Created task: {} by user {}", task.getId(), principal.getUserId());

        // Create StepTask for START step (auto-completed for audit)
        StepTask startStepTask = new StepTask();
        startStepTask.setTenant(project.getTenant());
        startStepTask.setTask(task);
        startStepTask.setWorkflowStep(startStep);
        startStepTask.setStepSequence(1);
        startStepTask.setStatus("COMPLETED");
        startStepTask.setBeginDate(Instant.now());
        startStepTask.setEndDate(Instant.now());
        startStepTask.setNote("Auto-completed on task creation");
        stepTaskRepository.save(startStepTask);
        log.info("Created START StepTask for task {}", task.getId());

        // Create StepTask for first business step (pending)
        StepTask businessStepTask = new StepTask();
        businessStepTask.setTenant(project.getTenant());
        businessStepTask.setTask(task);
        businessStepTask.setWorkflowStep(firstBusinessStep);
        businessStepTask.setStepSequence(2);
        businessStepTask.setStatus("PENDING");
        businessStepTask.setBeginDate(Instant.now());
        stepTaskRepository.save(businessStepTask);
        log.info("Created first business StepTask for task {}", task.getId());

        // If project is DRAFT, change it to ACTIVE when first task is created
        if (ProjectStatus.DRAFT.equals(project.getStatus())) {
            project.setStatus(ProjectStatus.ACTIVE);
            project.setUpdatedAt(Instant.now());
            projectRepository.save(project);
            log.info("Project {} status changed from DRAFT to ACTIVE", project.getId());
        }

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
        if (request.getStatus() != null) {
            // Only allow changing to CANCELLED if task is RUNNING
            if (request.getStatus() == TaskStatus.CANCELLED && task.getStatus() != TaskStatus.RUNNING) {
                throw new IllegalStateException("Can only cancel a running task");
            }
            // Don't allow changing from terminal states
            if (task.getStatus() == TaskStatus.COMPLETED || task.getStatus() == TaskStatus.CANCELLED) {
                throw new IllegalStateException("Cannot change status of completed or cancelled task");
            }
            task.setStatus(request.getStatus());
        }
        if (request.getProjectId() != null) {
            // Change project - validate new project belongs to same tenant
            Project newProject = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found"));
            if (!newProject.getTenant().getId().equals(principal.getTenantId())) {
                throw new IllegalArgumentException("Project not accessible");
            }
            task.setProject(newProject);
            log.info("Task {} moved to project {}", task.getId(), newProject.getId());
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

        // Task must be CANCELLED before deletion
        if (task.getStatus() != TaskStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Task must be cancelled before deletion. Current status: " + task.getStatus());
        }

        // Delete all related step tasks first
        stepTaskRepository.deleteByTaskId(taskId);
        log.info("Deleted {} step tasks for task {}", stepTaskRepository.findByTaskId(taskId).size(), taskId);

        // Delete the task
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
