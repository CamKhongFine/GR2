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
public class StepTaskActionResponse {
    private Long id;
    private Long taskId;
    private Long stepTaskId;
    private Long fromStepId;
    private String fromStepName;
    private Long toStepId;
    private String toStepName;
    private String actionName;
    private Long actorId;
    private String actorName;
    private String comment;
    private Instant createdAt;
}
