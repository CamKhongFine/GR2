package com.hust.auraflow.dto.response;

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
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private ProjectStatus status;
    private Long departmentId;
    private String departmentName;
    private Long divisionId;
    private String divisionName;
    private Long createdById;
    private String createdByName;
    private Instant beginDate;
    private Instant endDate;
    private Instant createdAt;
    private Instant updatedAt;
}
