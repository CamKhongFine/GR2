package com.hust.auraflow.service.impl;

import com.hust.auraflow.common.enums.WorkflowStepType;
import com.hust.auraflow.dto.request.CreateWorkflowRequest;
import com.hust.auraflow.dto.request.UpdateWorkflowRequest;
import com.hust.auraflow.dto.request.WorkflowStepRequest;
import com.hust.auraflow.dto.request.WorkflowTransitionRequest;
import com.hust.auraflow.dto.response.WorkflowDetailResponse;
import com.hust.auraflow.dto.response.WorkflowResponse;
import com.hust.auraflow.dto.response.WorkflowStepResponse;
import com.hust.auraflow.dto.response.WorkflowTransitionResponse;
import com.hust.auraflow.entity.Tenant;
import com.hust.auraflow.entity.User;
import com.hust.auraflow.entity.Workflow;
import com.hust.auraflow.entity.WorkflowStep;
import com.hust.auraflow.entity.WorkflowStepTransition;
import com.hust.auraflow.repository.*;
import com.hust.auraflow.security.UserPrincipal;
import com.hust.auraflow.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of WorkflowService.
 * All operations are transactional and tenant-scoped.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowServiceImpl implements WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final WorkflowStepRepository workflowStepRepository;
    private final WorkflowStepTransitionRepository workflowStepTransitionRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;

    @Override
    @Transactional
    public WorkflowDetailResponse createWorkflow(UserPrincipal principal, CreateWorkflowRequest request) {
        // Get user and validate tenant
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Long tenantId = user.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("User has no tenant");
        }

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        // Validate steps
        validateSteps(request.getSteps());

        // Validate transitions reference valid client IDs
        Set<String> clientIds = request.getSteps().stream()
                .map(WorkflowStepRequest::getClientId)
                .collect(Collectors.toSet());
        validateTransitions(request.getTransitions(), clientIds);

        // Create workflow
        Workflow workflow = new Workflow();
        workflow.setTenant(tenant);
        workflow.setName(request.getName());
        workflow.setDescription(request.getDescription());
        workflow.setIsActive(true);
        workflow.setCreatedBy(principal.getUserId());
        workflow.setUpdatedBy(principal.getUserId());
        workflow.setCreatedAt(Instant.now());
        workflow.setUpdatedAt(Instant.now());

        Workflow savedWorkflow = workflowRepository.save(workflow);
        log.info("Created workflow {} for tenant {}", savedWorkflow.getId(), tenantId);

        // Create steps and build clientId -> WorkflowStep map
        Map<String, WorkflowStep> clientIdToStep = new HashMap<>();
        int order = 0;
        for (WorkflowStepRequest stepRequest : request.getSteps()) {
            WorkflowStep step = new WorkflowStep();
            step.setWorkflow(savedWorkflow);
            step.setName(stepRequest.getName());
            step.setDescription(stepRequest.getDescription());
            step.setStepType(stepRequest.getType().name());
            step.setStepOrder(stepRequest.getStepOrder() != null ? stepRequest.getStepOrder() : order++);
            step.setAssigneeType(stepRequest.getAssigneeType());
            step.setAssigneeValue(stepRequest.getAssigneeValue());
            step.setCreatedAt(Instant.now());
            step.setUpdatedAt(Instant.now());

            WorkflowStep savedStep = workflowStepRepository.save(step);
            clientIdToStep.put(stepRequest.getClientId(), savedStep);
            log.debug("Created step {} with clientId {} for workflow {}",
                    savedStep.getId(), stepRequest.getClientId(), savedWorkflow.getId());
        }

        // Create transitions using the clientId -> step mapping
        List<WorkflowStepTransition> savedTransitions = new ArrayList<>();
        if (request.getTransitions() != null) {
            for (WorkflowTransitionRequest transitionRequest : request.getTransitions()) {
                WorkflowStep fromStep = clientIdToStep.get(transitionRequest.getFrom());
                WorkflowStep toStep = clientIdToStep.get(transitionRequest.getTo());

                WorkflowStepTransition transition = new WorkflowStepTransition();
                transition.setFromStep(fromStep);
                transition.setToStep(toStep);
                transition.setAction(transitionRequest.getAction());

                WorkflowStepTransition savedTransition = workflowStepTransitionRepository.save(transition);
                savedTransitions.add(savedTransition);
                log.debug("Created transition {} -> {} with action {} for workflow {}",
                        fromStep.getId(), toStep.getId(), transitionRequest.getAction(), savedWorkflow.getId());
            }
        }

        return buildDetailResponse(savedWorkflow, new ArrayList<>(clientIdToStep.values()), savedTransitions);
    }

    @Override
    @Transactional(readOnly = true)
    public WorkflowDetailResponse getWorkflowById(UserPrincipal principal, Long workflowId) {
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Long tenantId = user.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("User has no tenant");
        }

        Workflow workflow = workflowRepository.findByIdAndTenantId(workflowId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Workflow not found"));

        List<WorkflowStep> steps = workflowStepRepository.findByWorkflowIdOrderByStepOrder(workflowId);
        List<WorkflowStepTransition> transitions = workflowStepTransitionRepository.findByWorkflowId(workflowId);

        return buildDetailResponse(workflow, steps, transitions);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WorkflowResponse> listWorkflows(UserPrincipal principal, Pageable pageable) {
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Long tenantId = user.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("User has no tenant");
        }

        Page<Workflow> workflows = workflowRepository.findByTenantId(tenantId, pageable);

        return workflows.map(this::buildListResponse);
    }

    @Override
    @Transactional
    public WorkflowDetailResponse updateWorkflow(UserPrincipal principal, Long workflowId,
            UpdateWorkflowRequest request) {
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Long tenantId = user.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("User has no tenant");
        }

        Workflow workflow = workflowRepository.findByIdAndTenantId(workflowId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Workflow not found"));

        // Check if workflow is in use
        if (taskRepository.existsByWorkflowId(workflowId)) {
            throw new IllegalStateException("Cannot update workflow: it is currently in use by tasks");
        }

        // Validate steps
        validateSteps(request.getSteps());

        // Validate transitions reference valid client IDs
        Set<String> clientIds = request.getSteps().stream()
                .map(WorkflowStepRequest::getClientId)
                .collect(Collectors.toSet());
        validateTransitions(request.getTransitions(), clientIds);

        // Delete existing transitions and steps
        workflowStepTransitionRepository.deleteByWorkflowId(workflowId);
        workflowStepRepository.deleteByWorkflowId(workflowId);

        // Update workflow
        workflow.setName(request.getName());
        workflow.setDescription(request.getDescription());
        if (request.getIsActive() != null) {
            workflow.setIsActive(request.getIsActive());
        }
        workflow.setUpdatedBy(principal.getUserId());
        workflow.setUpdatedAt(Instant.now());

        Workflow savedWorkflow = workflowRepository.save(workflow);
        log.info("Updated workflow {} for tenant {}", savedWorkflow.getId(), tenantId);

        // Create new steps
        Map<String, WorkflowStep> clientIdToStep = new HashMap<>();
        int order = 0;
        for (WorkflowStepRequest stepRequest : request.getSteps()) {
            WorkflowStep step = new WorkflowStep();
            step.setWorkflow(savedWorkflow);
            step.setName(stepRequest.getName());
            step.setDescription(stepRequest.getDescription());
            step.setStepType(stepRequest.getType().name());
            step.setStepOrder(stepRequest.getStepOrder() != null ? stepRequest.getStepOrder() : order++);
            step.setAssigneeType(stepRequest.getAssigneeType());
            step.setAssigneeValue(stepRequest.getAssigneeValue());
            step.setCreatedAt(Instant.now());
            step.setUpdatedAt(Instant.now());

            WorkflowStep savedStep = workflowStepRepository.save(step);
            clientIdToStep.put(stepRequest.getClientId(), savedStep);
        }

        // Create new transitions
        List<WorkflowStepTransition> savedTransitions = new ArrayList<>();
        if (request.getTransitions() != null) {
            for (WorkflowTransitionRequest transitionRequest : request.getTransitions()) {
                WorkflowStep fromStep = clientIdToStep.get(transitionRequest.getFrom());
                WorkflowStep toStep = clientIdToStep.get(transitionRequest.getTo());

                WorkflowStepTransition transition = new WorkflowStepTransition();
                transition.setFromStep(fromStep);
                transition.setToStep(toStep);
                transition.setAction(transitionRequest.getAction());

                WorkflowStepTransition savedTransition = workflowStepTransitionRepository.save(transition);
                savedTransitions.add(savedTransition);
            }
        }

        return buildDetailResponse(savedWorkflow, new ArrayList<>(clientIdToStep.values()), savedTransitions);
    }

    @Override
    @Transactional
    public void deleteWorkflow(UserPrincipal principal, Long workflowId) {
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Long tenantId = user.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("User has no tenant");
        }

        Workflow workflow = workflowRepository.findByIdAndTenantId(workflowId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Workflow not found"));

        // Check if workflow is in use
        if (taskRepository.existsByWorkflowId(workflowId)) {
            throw new IllegalStateException("Cannot delete workflow: it is currently in use by tasks");
        }

        // Delete transitions, steps, then workflow
        workflowStepTransitionRepository.deleteByWorkflowId(workflowId);
        workflowStepRepository.deleteByWorkflowId(workflowId);
        workflowRepository.delete(workflow);

        log.info("Deleted workflow {} from tenant {}", workflowId, tenantId);
    }

    // ============ Validation Methods ============

    private void validateSteps(List<WorkflowStepRequest> steps) {
        if (steps == null || steps.isEmpty()) {
            throw new IllegalArgumentException("At least one step is required");
        }

        // Check for exactly one START step
        long startCount = steps.stream()
                .filter(s -> s.getType() == WorkflowStepType.START)
                .count();
        if (startCount == 0) {
            throw new IllegalArgumentException("Workflow must have exactly one START step");
        }
        if (startCount > 1) {
            throw new IllegalArgumentException("Workflow must have exactly one START step, found " + startCount);
        }

        // Check for at least one END step
        long endCount = steps.stream()
                .filter(s -> s.getType() == WorkflowStepType.END)
                .count();
        if (endCount == 0) {
            throw new IllegalArgumentException("Workflow must have at least one END step");
        }

        // Check for duplicate clientIds
        Set<String> clientIds = new HashSet<>();
        for (WorkflowStepRequest step : steps) {
            if (!clientIds.add(step.getClientId())) {
                throw new IllegalArgumentException("Duplicate clientId: " + step.getClientId());
            }
        }
    }

    private void validateTransitions(List<WorkflowTransitionRequest> transitions, Set<String> validClientIds) {
        if (transitions == null) {
            return; // Transitions are optional
        }

        for (WorkflowTransitionRequest transition : transitions) {
            if (!validClientIds.contains(transition.getFrom())) {
                throw new IllegalArgumentException("Invalid 'from' clientId in transition: " + transition.getFrom());
            }
            if (!validClientIds.contains(transition.getTo())) {
                throw new IllegalArgumentException("Invalid 'to' clientId in transition: " + transition.getTo());
            }
        }
    }

    // ============ Response Builder Methods ============

    private WorkflowDetailResponse buildDetailResponse(Workflow workflow,
            List<WorkflowStep> steps,
            List<WorkflowStepTransition> transitions) {
        List<WorkflowStepResponse> stepResponses = steps.stream()
                .map(this::buildStepResponse)
                .sorted(Comparator.comparing(WorkflowStepResponse::getStepOrder,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());

        List<WorkflowTransitionResponse> transitionResponses = transitions.stream()
                .map(this::buildTransitionResponse)
                .collect(Collectors.toList());

        return WorkflowDetailResponse.builder()
                .id(workflow.getId())
                .name(workflow.getName())
                .description(workflow.getDescription())
                .isActive(workflow.getIsActive())
                .steps(stepResponses)
                .transitions(transitionResponses)
                .createdAt(workflow.getCreatedAt())
                .updatedAt(workflow.getUpdatedAt())
                .build();
    }

    private WorkflowResponse buildListResponse(Workflow workflow) {
        return WorkflowResponse.builder()
                .id(workflow.getId())
                .name(workflow.getName())
                .description(workflow.getDescription())
                .isActive(workflow.getIsActive())
                .createdAt(workflow.getCreatedAt())
                .build();
    }

    private WorkflowStepResponse buildStepResponse(WorkflowStep step) {
        WorkflowStepType type = null;
        try {
            type = WorkflowStepType.valueOf(step.getStepType());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown step type: {} for step {}", step.getStepType(), step.getId());
        }

        // Resolve assignee name if assigneeValue is a user ID
        String assigneeName = null;
        if (step.getAssigneeValue() != null && !step.getAssigneeValue().isEmpty()) {
            try {
                Long userId = Long.parseLong(step.getAssigneeValue());
                assigneeName = userRepository.findById(userId)
                        .map(user -> {
                            String firstName = user.getFirstName() != null ? user.getFirstName() : "";
                            String lastName = user.getLastName() != null ? user.getLastName() : "";
                            String fullName = (firstName + " " + lastName).trim();
                            return fullName.isEmpty() ? user.getEmail() : fullName;
                        })
                        .orElse(null);
            } catch (NumberFormatException e) {
                // assigneeValue is not a user ID (could be role/department)
                assigneeName = step.getAssigneeValue();
            }
        }

        return WorkflowStepResponse.builder()
                .id(step.getId())
                .name(step.getName())
                .description(step.getDescription())
                .type(type)
                .stepOrder(step.getStepOrder())
                .assigneeType(step.getAssigneeType())
                .assigneeValue(step.getAssigneeValue())
                .assigneeName(assigneeName)
                .build();
    }

    private WorkflowTransitionResponse buildTransitionResponse(WorkflowStepTransition transition) {
        return WorkflowTransitionResponse.builder()
                .id(transition.getId())
                .fromStepId(transition.getFromStep().getId())
                .toStepId(transition.getToStep().getId())
                .action(transition.getAction())
                .build();
    }
}
