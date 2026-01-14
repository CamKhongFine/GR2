package com.hust.auraflow.dto.request;

import com.hust.auraflow.common.enums.TaskStatus;
import com.hust.auraflow.common.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskRequest {
    private String title;
    private String description;
    private Priority priority;
    private TaskStatus status;
    private Long projectId;
    private Instant beginDate;
    private Instant endDate;
}
