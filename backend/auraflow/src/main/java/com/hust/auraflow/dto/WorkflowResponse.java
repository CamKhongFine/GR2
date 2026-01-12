package com.hust.auraflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO for workflow list response (minimal info).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowResponse {

    private Long id;

    private String name;

    private String description;

    private Boolean isActive;

    private Instant createdAt;
}
