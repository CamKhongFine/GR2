package com.hust.auraflow.service.impl;

import com.hust.auraflow.dto.response.DepartmentResponse;
import com.hust.auraflow.dto.response.DivisionResponse;
import com.hust.auraflow.dto.response.RoleResponse;
import com.hust.auraflow.dto.response.UserResponse;
import com.hust.auraflow.entity.Role;
import com.hust.auraflow.entity.User;
import com.hust.auraflow.entity.UserRole;
import com.hust.auraflow.entity.UserRoleId;
import com.hust.auraflow.repository.RoleRepository;
import com.hust.auraflow.repository.UserRepository;
import com.hust.auraflow.repository.UserRoleRepository;
import com.hust.auraflow.service.UserRoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserRoleServiceImpl implements UserRoleService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;

    @Override
    @Transactional
    public UserResponse assignRoles(Long userId, List<Long> roleIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", userId);
                    return new RuntimeException("User not found with ID: " + userId);
                });

        List<UserRole> existingRoles = userRoleRepository.findByIdUserId(userId);
        userRoleRepository.deleteAll(existingRoles);

        for (Long roleId : roleIds) {
            Role role = roleRepository.findById(roleId)
                    .orElseThrow(() -> new RuntimeException("Role not found with ID: " + roleId));

            UserRoleId userRoleId = new UserRoleId();
            userRoleId.setUserId(userId);
            userRoleId.setRoleId(roleId);

            UserRole userRole = new UserRole();
            userRole.setId(userRoleId);
            userRole.setUser(user);
            userRole.setRole(role);

            userRoleRepository.save(userRole);
        }

        log.info("Assigned {} roles to user {}", roleIds.size(), userId);
        return buildUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse unassignRole(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", userId);
                    return new RuntimeException("User not found with ID: " + userId);
                });

        UserRoleId userRoleId = new UserRoleId();
        userRoleId.setUserId(userId);
        userRoleId.setRoleId(roleId);

        userRoleRepository.deleteById(userRoleId);
        log.info("Unassigned role {} from user {}", roleId, userId);
        
        return buildUserResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserRoles(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", userId);
                    return new RuntimeException("User not found with ID: " + userId);
                });

        return buildUserResponse(user);
    }

    private UserResponse buildUserResponse(User user) {
        List<UserRole> userRoles = userRoleRepository.findByIdUserId(user.getId());
        List<RoleResponse> roles = userRoles.stream()
                .map(UserRole::getRole)
                .filter(java.util.Objects::nonNull)
                .map(RoleResponse::fromEntity)
                .collect(Collectors.toList());

        DivisionResponse divisionResponse = null;
        if (user.getDivision() != null) {
            divisionResponse = DivisionResponse.builder()
                    .id(user.getDivision().getId())
                    .name(user.getDivision().getName())
                    .description(user.getDivision().getDescription())
                    .build();
        }

        DepartmentResponse departmentResponse = null;
        if (user.getDepartment() != null) {
            departmentResponse = DepartmentResponse.builder()
                    .id(user.getDepartment().getId())
                    .tenantId(user.getDepartment().getTenantId())
                    .name(user.getDepartment().getName())
                    .description(user.getDepartment().getDescription())
                    .build();
        }

        return UserResponse.builder()
                .id(user.getId())
                .tenantId(user.getTenantId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .title(user.getTitle())
                .avatarUrl(user.getAvatarUrl())
                .division(divisionResponse)
                .department(departmentResponse)
                .roles(roles)
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
