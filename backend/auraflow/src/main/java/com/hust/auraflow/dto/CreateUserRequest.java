package com.hust.auraflow.dto;

import com.hust.auraflow.common.enums.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotNull(message = "Tenant ID is required")
    private Long tenantId;
    
    private String firstName;
    private String lastName;
    private String title;
    private String avatarUrl;
    
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;
    
    private Long divisionId;
    private Long departmentId;
}
