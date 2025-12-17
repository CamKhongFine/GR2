package com.hust.auraflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentResponse {
    private Long id;
    private Long tenantId;
    private String name;
    private String description;
    private Long divisionId;
    private String divisionName;
    private Instant createdAt;
    private Instant updatedAt;
}

