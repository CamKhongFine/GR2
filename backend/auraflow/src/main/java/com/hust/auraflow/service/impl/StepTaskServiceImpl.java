package com.hust.auraflow.service.impl;

import com.hust.auraflow.common.enums.Priority;
import com.hust.auraflow.common.enums.StepTaskStatus;
import com.hust.auraflow.common.enums.TaskStatus;
import com.hust.auraflow.dto.request.ExecuteActionRequest;
import com.hust.auraflow.dto.response.StepTaskActionResponse;
import com.hust.auraflow.dto.response.StepTaskResponse;
import com.hust.auraflow.dto.response.TaskResponse;
import com.hust.auraflow.entity.*;
import com.hust.auraflow.repository.*;
import com.hust.auraflow.security.UserPrincipal;
import com.hust.auraflow.service.StepTaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StepTaskServiceImpl implements StepTaskService {

    private final TaskRepository taskRepository;
    private final StepTaskRepository stepTaskRepository;
    private final StepTaskActionRepository stepTaskActionRepository;
    private final WorkflowStepTransitionRepository workflowStepTransitionRepository;
    private final UserRepository userRepository;
    private final TaskStepAssignmentConfigRepository taskStepAssignmentConfigRepository;

    @Override
    @Transactional(readOnly = true)
    public List<StepTaskResponse> getStepTasksByTaskId(UserPrincipal principal, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        validateTenantAccess(principal, task);

        List<StepTask> stepTasks = stepTaskRepository.findByTaskIdOrderByStepSequence(taskId);
        return stepTasks.stream()
                .map(this::toStepTaskResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public StepTaskResponse getCurrentStepTask(UserPrincipal principal, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        validateTenantAccess(principal, task);

        StepTask currentStepTask = stepTaskRepository.findCurrentActiveByTaskId(taskId, StepTaskStatus.IN_PROGRESS)
                .orElseThrow(() -> new IllegalArgumentException("No active step task found"));

        return toStepTaskResponse(currentStepTask);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isUserAssigneeOfCurrentStep(UserPrincipal principal, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        validateTenantAccess(principal, task);

        if (task.getCurrentStep() == null) {
            return false;
        }

        // Check if current step has FIXED assignee matching current user
        WorkflowStep currentStep = task.getCurrentStep();
        if (currentStep.getAssigneeType() != null && currentStep.getAssigneeType().equals("FIXED")) {
            if (currentStep.getAssigneeValue() != null) {
                return currentStep.getAssigneeValue().equals(principal.getUserId().toString());
            }
        }

        // Check StepTask assigned user
        StepTask currentStepTask = stepTaskRepository.findByTaskIdAndWorkflowStepId(taskId, currentStep.getId())
                .orElse(null);
        if (currentStepTask != null && currentStepTask.getAssignedUser() != null) {
            return currentStepTask.getAssignedUser().getId().equals(principal.getUserId());
        }

        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StepTaskActionResponse> getTaskActions(UserPrincipal principal, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        validateTenantAccess(principal, task);

        List<StepTaskAction> actions = stepTaskActionRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
        return actions.stream()
                .map(this::toStepTaskActionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TaskResponse executeAction(UserPrincipal principal, Long taskId, ExecuteActionRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        validateTenantAccess(principal, task);

        if (task.getStatus() != TaskStatus.RUNNING) {
            throw new IllegalStateException("Task is not in RUNNING status");
        }

        if (task.getCurrentStep() == null) {
            throw new IllegalStateException("Task has no current step");
        }

        // Check if user is assignee
        if (!isUserAssigneeOfCurrentStep(principal, taskId)) {
            throw new IllegalStateException("User is not the assignee of the current step");
        }

        // Find transition by action name
        WorkflowStepTransition transition = workflowStepTransitionRepository.findByWorkflowId(task.getWorkflow().getId())
                .stream()
                .filter(t -> t.getFromStep().getId().equals(task.getCurrentStep().getId())
                        && t.getAction() != null
                        && t.getAction().equalsIgnoreCase(request.getActionName()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "No transition found for action: " + request.getActionName()));

        // Get current StepTask
        StepTask currentStepTask = stepTaskRepository
                .findByTaskIdAndWorkflowStepId(taskId, task.getCurrentStep().getId())
                .orElseThrow(() -> new IllegalStateException("Current step task not found"));

        // Get actor user
        User actor = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Update current StepTask to COMPLETED
        currentStepTask.setStatus(StepTaskStatus.COMPLETED);
        currentStepTask.setEndDate(Instant.now());
        if (request.getComment() != null && !request.getComment().trim().isEmpty()) {
            currentStepTask.setNote(request.getComment());
        }
        stepTaskRepository.save(currentStepTask);

        // Delete assignment config for the completed step (only for DYNAMIC and FIXED steps with config)
        if (currentStepTask.getWorkflowStep() != null) {
            WorkflowStep completedStep = currentStepTask.getWorkflowStep();
            if (completedStep.getAssigneeType() != null && 
                (completedStep.getAssigneeType().name().equals("DYNAMIC") || 
                 completedStep.getAssigneeType().name().equals("FIXED"))) {
                taskStepAssignmentConfigRepository.deleteByTaskIdAndWorkflowStepId(
                        taskId, completedStep.getId());
                log.info("Deleted assignment config for completed step {} in task {}", 
                        completedStep.getId(), taskId);
            }
        }

        // Create StepTaskAction log
        StepTaskAction actionLog = StepTaskAction.builder()
                .tenant(task.getTenant())
                .task(task)
                .stepTask(currentStepTask)
                .fromStep(task.getCurrentStep())
                .toStep(transition.getToStep())
                .actionName(request.getActionName())
                .actor(actor)
                .comment(request.getComment())
                .createdAt(Instant.now())
                .build();
        stepTaskActionRepository.save(actionLog);

        // Update task current step
        WorkflowStep nextStep = transition.getToStep();
        task.setCurrentStep(nextStep);
        task.setUpdatedAt(Instant.now());

        // If next step is END, mark task as COMPLETED
        if ("END".equals(nextStep.getStepType())) {
            task.setStatus(TaskStatus.COMPLETED);
            // Create END StepTask
            StepTask endStepTask = new StepTask();
            endStepTask.setTenant(task.getTenant());
            endStepTask.setTask(task);
            endStepTask.setWorkflowStep(nextStep);
            endStepTask.setStepSequence(currentStepTask.getStepSequence() + 1);
            endStepTask.setStatus(StepTaskStatus.COMPLETED);
            endStepTask.setPriority(Priority.NORMAL);
            endStepTask.setBeginDate(Instant.now());
            endStepTask.setEndDate(Instant.now());
            stepTaskRepository.save(endStepTask);
        } else {
            // Create new StepTask for next step
            StepTask nextStepTask = new StepTask();
            nextStepTask.setTenant(task.getTenant());
            nextStepTask.setTask(task);
            nextStepTask.setWorkflowStep(nextStep);
            nextStepTask.setStepSequence(currentStepTask.getStepSequence() + 1);
            nextStepTask.setStatus(StepTaskStatus.IN_PROGRESS);
            nextStepTask.setBeginDate(Instant.now());
            
            // Default priority is NORMAL if not provided
            nextStepTask.setPriority(Priority.NORMAL);

            // Set assignee and priority based on step type
            if (nextStep.getAssigneeType() != null) {
                if (nextStep.getAssigneeType().name().equals("DYNAMIC")) {
                    // Query assignee and priority from assignment config
                    TaskStepAssignmentConfig config = taskStepAssignmentConfigRepository
                            .findByTaskIdAndWorkflowStepId(task.getId(), nextStep.getId())
                            .orElse(null);
                    if (config != null && config.getAssignee() != null) {
                        nextStepTask.setAssignedUser(config.getAssignee());
                        if (config.getPriority() != null) {
                            nextStepTask.setPriority(config.getPriority());
                        }
                        log.info("Snapshotted assignee {} with priority {} for step {} in task {} from config", 
                                config.getAssignee().getId(), config.getPriority(), nextStep.getId(), task.getId());
                        // Config will be deleted when this StepTask is COMPLETED
                    } else {
                        log.warn("No assignment config found for DYNAMIC step {} in task {}", nextStep.getId(), task.getId());
                    }
                } else if (nextStep.getAssigneeType().name().equals("FIXED")) {
                    // For FIXED steps, get assignee from step's assigneeValue
                    if (nextStep.getAssigneeValue() != null) {
                        try {
                            Long assigneeId = Long.parseLong(nextStep.getAssigneeValue());
                            User assignee = userRepository.findById(assigneeId).orElse(null);
                            if (assignee != null) {
                                nextStepTask.setAssignedUser(assignee);
                            }
                        } catch (NumberFormatException e) {
                            log.warn("Invalid assignee value for step {}: {}", nextStep.getId(), nextStep.getAssigneeValue());
                        }
                    }
                    // For FIXED steps, check if priority is in config (if provided during task creation)
                    TaskStepAssignmentConfig config = taskStepAssignmentConfigRepository
                            .findByTaskIdAndWorkflowStepId(task.getId(), nextStep.getId())
                            .orElse(null);
                    if (config != null && config.getPriority() != null) {
                        nextStepTask.setPriority(config.getPriority());
                        // Config will be deleted when this StepTask is COMPLETED
                    }
                }
            }

            stepTaskRepository.save(nextStepTask);
        }

        Task savedTask = taskRepository.save(task);
        log.info("Executed action {} on task {} by user {}", request.getActionName(), taskId, principal.getUserId());

        return toTaskResponse(savedTask);
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

    private void validateTenantAccess(UserPrincipal principal, Task task) {
        Long tenantId = principal.getTenantId();
        if (tenantId == null || !task.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Task not accessible");
        }
    }

    private StepTaskResponse toStepTaskResponse(StepTask stepTask) {
        return StepTaskResponse.builder()
                .id(stepTask.getId())
                .taskId(stepTask.getTask() != null ? stepTask.getTask().getId() : null)
                .workflowStepId(stepTask.getWorkflowStep() != null ? stepTask.getWorkflowStep().getId() : null)
                .workflowStepName(stepTask.getWorkflowStep() != null ? stepTask.getWorkflowStep().getName() : null)
                .stepSequence(stepTask.getStepSequence())
                .status(stepTask.getStatus())
                .assignedUserId(stepTask.getAssignedUser() != null ? stepTask.getAssignedUser().getId() : null)
                .assignedUserName(stepTask.getAssignedUser() != null
                        ? (stepTask.getAssignedUser().getFirstName() + " " + stepTask.getAssignedUser().getLastName())
                                .trim()
                        : null)
                .priority(stepTask.getPriority())
                .beginDate(stepTask.getBeginDate())
                .endDate(stepTask.getEndDate())
                .note(stepTask.getNote())
                .build();
    }

    private StepTaskActionResponse toStepTaskActionResponse(StepTaskAction action) {
        return StepTaskActionResponse.builder()
                .id(action.getId())
                .taskId(action.getTask() != null ? action.getTask().getId() : null)
                .stepTaskId(action.getStepTask() != null ? action.getStepTask().getId() : null)
                .fromStepId(action.getFromStep() != null ? action.getFromStep().getId() : null)
                .fromStepName(action.getFromStep() != null ? action.getFromStep().getName() : null)
                .toStepId(action.getToStep() != null ? action.getToStep().getId() : null)
                .toStepName(action.getToStep() != null ? action.getToStep().getName() : null)
                .actionName(action.getActionName())
                .actorId(action.getActor() != null ? action.getActor().getId() : null)
                .actorName(action.getActor() != null
                        ? (action.getActor().getFirstName() + " " + action.getActor().getLastName()).trim()
                        : null)
                .comment(action.getComment())
                .createdAt(action.getCreatedAt())
                .build();
    }
}
