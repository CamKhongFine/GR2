package com.hust.auraflow.dto;

import com.hust.auraflow.common.enums.TenantStatus;
import com.hust.auraflow.entity.Tenant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantResponse {
    private Long id;
    private String name;
    private TenantStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    public static TenantResponse fromEntity(Tenant tenant) {
        return TenantResponse.builder()
                .id(tenant.getId())
                .name(tenant.getName())
                .status(tenant.getStatus())
                .createdAt(tenant.getCreatedAt())
                .updatedAt(tenant.getUpdatedAt())
                .build();
    }
}

