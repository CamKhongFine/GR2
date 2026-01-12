package com.hust.auraflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a workflow transition within a workflow.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTransitionRequest {

    /**
     * Client-side ID of the source step.
     */
    @NotBlank(message = "From step client ID is required")
    private String from;

    /**
     * Client-side ID of the target step.
     */
    @NotBlank(message = "To step client ID is required")
    private String to;

    /**
     * Action name that triggers this transition (e.g., "submit", "approve",
     * "reject").
     */
    @NotBlank(message = "Action is required")
    private String action;
}
