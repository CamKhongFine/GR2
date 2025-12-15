package com.hust.auraflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InviteRequestDTO {
    @NotNull(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotNull(message = "Tenant ID is required")
    private Long tenantId;
}

