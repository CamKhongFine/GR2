package com.hust.auraflow.dto.response;

import com.hust.auraflow.common.enums.Priority;
import com.hust.auraflow.common.enums.StepTaskStatus;
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
    private StepTaskStatus status;
    private Long assignedUserId;
    private String assignedUserName;
    private Priority priority;
    private Instant beginDate;
    private Instant endDate;
    private String note;
}
