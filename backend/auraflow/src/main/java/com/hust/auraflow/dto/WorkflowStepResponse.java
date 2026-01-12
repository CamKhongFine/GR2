package com.hust.auraflow.dto;

import com.hust.auraflow.common.enums.WorkflowStepType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for workflow step response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStepResponse {

    private Long id;

    private String name;

    private String description;

    private WorkflowStepType type;

    private Integer stepOrder;
}
