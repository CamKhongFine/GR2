package com.hust.auraflow.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for creating a workflow with its steps and transitions atomically.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateWorkflowRequest {

    @NotBlank(message = "Workflow name is required")
    private String name;

    private String description;

    /**
     * List of workflow steps. Must contain exactly one START step and at least one
     * END step.
     */
    @NotEmpty(message = "At least one step is required")
    @Valid
    private List<WorkflowStepRequest> steps;

    /**
     * List of transitions between steps. Uses clientId to reference steps.
     */
    @Valid
    private List<WorkflowTransitionRequest> transitions;
}
