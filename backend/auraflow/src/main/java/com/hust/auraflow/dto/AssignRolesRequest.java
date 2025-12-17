package com.hust.auraflow.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignRolesRequest {
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotEmpty(message = "At least one role ID is required")
    private List<Long> roleIds;
}
