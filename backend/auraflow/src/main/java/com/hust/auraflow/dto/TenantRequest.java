package com.hust.auraflow.dto;

import com.hust.auraflow.common.enums.TenantStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TenantRequest {
    @NotBlank(message = "Name is required")
    private String name;
    private TenantStatus status;
}

