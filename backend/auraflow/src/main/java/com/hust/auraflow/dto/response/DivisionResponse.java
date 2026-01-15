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
public class DivisionResponse {
    private Long id;
    private Long tenantId;
    private String name;
    private String description;
    private Instant createdAt;
    private Instant updatedAt;
}

