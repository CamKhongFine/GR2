package com.hust.auraflow.dto.request;

import com.hust.auraflow.common.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTaskRequest {
    @NotNull
    private Long projectId;

    @NotNull
    private Long workflowId;

    @NotBlank
    private String title;

    private String description;

    private Priority priority;

    private Instant beginDate;

    private Instant endDate;

    private List<StepAssignment> stepAssignments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StepAssignment {
        @NotNull
        private Long workflowStepId;

        @NotNull
        private Long assigneeId;

        private Priority priority;
    }
}
