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
public class StepTaskFileResponse {
    private Long id;
    private String fileName;
    private String objectName;
    private Long fileSize;
    private Long uploadedById;
    private String uploadedByName;
    private Instant createdAt;
}
