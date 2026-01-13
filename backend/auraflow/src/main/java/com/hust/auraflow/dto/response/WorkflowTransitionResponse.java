package com.hust.auraflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for workflow transition response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTransitionResponse {

    private Long id;

    private Long fromStepId;

    private Long toStepId;

    private String action;
}
