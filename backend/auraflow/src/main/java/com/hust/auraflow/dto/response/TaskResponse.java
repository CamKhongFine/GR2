package com.hust.auraflow.dto.response;

import com.hust.auraflow.entity.TaskPriority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private Long id;
    private Long projectId;
    private String projectName;
    private Long workflowId;
    private String workflowName;
    private String title;
    private String description;
    private String status;
    private TaskPriority priority;
    private Long currentStepId;
    private String currentStepName;
    private Long creatorId;
    private String creatorName;
    private Instant beginDate;
    private Instant endDate;
    private Instant createdAt;
    private Instant updatedAt;
}
