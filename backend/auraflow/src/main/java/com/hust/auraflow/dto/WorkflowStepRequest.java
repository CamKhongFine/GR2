package com.hust.auraflow.dto;

import com.hust.auraflow.common.enums.WorkflowStepType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a workflow step within a workflow.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStepRequest {

    /**
     * Client-side ID used to reference this step in transitions.
     * This is NOT persisted - used only for mapping during creation.
     */
    @NotBlank(message = "Client ID is required")
    private String clientId;

    @NotBlank(message = "Step name is required")
    private String name;

    private String description;

    @NotNull(message = "Step type is required")
    private WorkflowStepType type;

    /**
     * Optional order of the step in the workflow.
     */
    private Integer stepOrder;
}
