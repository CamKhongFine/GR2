package com.hust.auraflow.dto.request;

import com.hust.auraflow.common.enums.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProjectRequest {
    private String name;

    private String description;

    private ProjectStatus status;

    private Instant beginDate;

    private Instant endDate;
}
