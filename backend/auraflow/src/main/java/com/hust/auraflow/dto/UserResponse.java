package com.hust.auraflow.dto;

import com.hust.auraflow.common.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private Long tenantId;
    private String email;
    private String firstName;
    private String lastName;
    private String title;
    private String avatarUrl;
    private DivisionResponse division;
    private DepartmentResponse department;
    private List<RoleResponse> roles;
    private UserStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

