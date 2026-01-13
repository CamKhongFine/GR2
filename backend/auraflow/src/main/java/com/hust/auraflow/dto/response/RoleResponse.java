package com.hust.auraflow.dto.response;

import com.hust.auraflow.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleResponse {

    private Long id;
    private String name;
    private Integer level;
    private String description;
    private Instant createdAt;
    private Instant updatedAt;

    public static RoleResponse fromEntity(Role role) {
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .level(role.getLevel())
                .description(role.getDescription())
                .createdAt(role.getCreatedAt())
                .updatedAt(role.getUpdatedAt())
                .build();
    }
}


