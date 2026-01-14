package com.hust.auraflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StepTaskResponse {
    private Long id;
    private Long taskId;
    private Long workflowStepId;
    private String workflowStepName;
    private Integer stepSequence;
    private String status;
    private Long assignedUserId;
    private String assignedUserName;
    private Instant beginDate;
    private Instant endDate;
    private String note;
}
