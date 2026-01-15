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
public class StepTaskDataResponse {
    private Long id;
    private String dataBody;
    private String dataType;
    private Long createdById;
    private String createdByName;
    private Instant createdAt;
}
