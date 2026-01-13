package com.hust.auraflow.service;

import com.hust.auraflow.dto.response.UserResponse;

import java.util.List;

public interface UserRoleService {
    UserResponse assignRoles(Long userId, List<Long> roleIds);
    UserResponse unassignRole(Long userId, Long roleId);
    UserResponse getUserRoles(Long userId);
}
