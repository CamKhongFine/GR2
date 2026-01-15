package com.hust.auraflow.dto.response;

import com.hust.auraflow.common.enums.AssigneeType;
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

    /**
     * Assignee type: FIXED (predefined) or DYNAMIC (selected at runtime).
     */
    private AssigneeType assigneeType;

    /**
     * Assignee value - user ID for FIXED type, null for DYNAMIC.
     */
    private String assigneeValue;

    /**
     * Resolved assignee name when assigneeType is FIXED.
     */
    private String assigneeName;
}
