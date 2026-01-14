package com.hust.auraflow.dto.request;

import com.hust.auraflow.entity.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

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

    private TaskPriority priority;

    private Instant beginDate;

    private Instant endDate;
}
