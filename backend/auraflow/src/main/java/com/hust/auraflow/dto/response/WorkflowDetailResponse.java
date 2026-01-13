package com.hust.auraflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * DTO for detailed workflow response including steps and transitions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowDetailResponse {

    private Long id;

    private String name;

    private String description;

    private Boolean isActive;

    private List<WorkflowStepResponse> steps;

    private List<WorkflowTransitionResponse> transitions;

    private Instant createdAt;

    private Instant updatedAt;
}
