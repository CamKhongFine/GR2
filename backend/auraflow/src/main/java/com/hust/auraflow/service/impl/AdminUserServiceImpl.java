package com.hust.auraflow.service.impl;

import com.hust.auraflow.common.enums.UserStatus;
import com.hust.auraflow.dto.*;
import com.hust.auraflow.entity.*;
import com.hust.auraflow.repository.*;
import com.hust.auraflow.security.UserPrincipal;
import com.hust.auraflow.service.AdminUserService;
import com.hust.auraflow.service.AuthService;
import com.hust.auraflow.service.RabbitMQProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final DivisionRepository divisionRepository;
    private final DepartmentRepository departmentRepository;
    private final AuthService authService;
    private final RabbitMQProducer rabbitMQProducer;

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getTenantUsers(
            UserPrincipal principal,
            String email,
            String status,
            Integer roleLevel,
            Pageable pageable) {
        
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Long tenantId = admin.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Admin user has no tenant");
        }
        
        List<UserRole> adminRoles = userRoleRepository.findByIdUserId(principal.getUserId());
        int adminRoleLevel = adminRoles.stream()
                .map(UserRole::getRole)
                .filter(java.util.Objects::nonNull)
                .mapToInt(Role::getLevel)
                .min()
                .orElse(Integer.MAX_VALUE);
        
        Page<User> users = userRepository.findByFilters(null, email, status, tenantId, roleLevel, pageable);
        
        List<UserResponse> filteredUsers = users.getContent().stream()
                .filter(user -> {
                    List<UserRole> userRoles = userRoleRepository.findByIdUserId(user.getId());
                    
                    if (userRoles.isEmpty()) {
                        return true;
                    }
                    
                    boolean hasEqualOrLowerRole = userRoles.stream()
                            .map(UserRole::getRole)
                            .filter(java.util.Objects::nonNull)
                            .anyMatch(role -> role.getLevel() < adminRoleLevel);
                    
                    return !hasEqualOrLowerRole;
                })
                .map(this::buildUserResponse)
                .collect(Collectors.toList());
        
        return new PageImpl<>(
                filteredUsers,
                pageable,
                filteredUsers.size()
        );
    }

    @Override
    @Transactional
    public InviteResponse inviteTenantUser(UserPrincipal principal, String email) {
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Long tenantId = admin.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Admin user has no tenant");
        }
        
        InviteRequestDTO inviteRequest = new InviteRequestDTO();
        inviteRequest.setEmail(email);
        inviteRequest.setTenantId(tenantId);
        
        return authService.inviteUser(inviteRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Role> getAvailableRoles(UserPrincipal principal) {
        List<UserRole> adminRoles = userRoleRepository.findByIdUserId(principal.getUserId());
        
        int adminRoleLevel = adminRoles.stream()
                .map(UserRole::getRole)
                .filter(java.util.Objects::nonNull)
                .mapToInt(Role::getLevel)
                .min()
                .orElse(Integer.MAX_VALUE);
        
        return roleRepository.findAll().stream()
                .filter(role -> role.getLevel() > adminRoleLevel)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponse updateTenantUser(UserPrincipal principal, Long userId, UpdateUserRequest request) {
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (!user.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("User does not belong to your tenant");
        }
        
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getTitle() != null) {
            user.setTitle(request.getTitle());
        }
        if (request.getDivisionId() != null) {
            Division division = divisionRepository.findById(request.getDivisionId())
                    .orElseThrow(() -> new IllegalArgumentException("Division not found"));
            user.setDivision(division);
        }
        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found"));
            if (!department.getTenantId().equals(user.getTenantId())) {
                throw new IllegalArgumentException("Department does not belong to user's tenant");
            }
            user.setDepartment(department);
        }
        
        User updatedUser = userRepository.save(user);
        return buildUserResponse(updatedUser);
    }

    @Override
    @Transactional
    public UserResponse assignRolesToTenantUser(UserPrincipal principal, Long userId, List<Long> roleIds) {
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (!user.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("User does not belong to your tenant");
        }
        
        List<UserRole> adminRoles = userRoleRepository.findByIdUserId(principal.getUserId());
        int adminRoleLevel = adminRoles.stream()
                .map(UserRole::getRole)
                .filter(java.util.Objects::nonNull)
                .mapToInt(Role::getLevel)
                .min()
                .orElse(Integer.MAX_VALUE);
        
        List<Role> rolesToAssign = roleRepository.findAllById(roleIds);
        for (Role role : rolesToAssign) {
            if (role.getLevel() <= adminRoleLevel) {
                throw new IllegalArgumentException(
                    String.format("Cannot assign role '%s' (level %d). You can only assign roles with level > %d",
                        role.getName(), role.getLevel(), adminRoleLevel)
                );
            }
        }
        
        userRoleRepository.deleteByIdUserId(userId);
        
        for (Long roleId : roleIds) {
            UserRoleId userRoleId = new UserRoleId(userId, roleId);
            UserRole userRole = new UserRole();
            userRole.setId(userRoleId);
            userRoleRepository.save(userRole);
        }
        
        return buildUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse activateTenantUser(UserPrincipal principal, Long userId) {
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (!user.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("User does not belong to your tenant");
        }
        
        user.setStatus(UserStatus.ACTIVE);
        User updatedUser = userRepository.save(user);
        log.info("Admin {} activated user {}", principal.getUserId(), userId);
        return buildUserResponse(updatedUser);
    }

    @Override
    @Transactional
    public UserResponse deactivateTenantUser(UserPrincipal principal, Long userId) {
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (!user.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("User does not belong to your tenant");
        }
        
        user.setStatus(UserStatus.INACTIVE);
        User updatedUser = userRepository.save(user);
        log.info("Admin {} deactivated user {}", principal.getUserId(), userId);
        return buildUserResponse(updatedUser);
    }

    @Override
    @Transactional
    public void deleteTenantUser(UserPrincipal principal, Long userId) {
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (!user.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("User does not belong to your tenant");
        }
        
        String keycloakSub = user.getKeycloakSub();
        String email = user.getEmail();
        
        userRepository.deleteById(userId);

        if (keycloakSub != null && !keycloakSub.isEmpty()) {
            rabbitMQProducer.publishDeleteUserMessage(keycloakSub, email);
        } else {
            log.warn("User {} has no Keycloak sub, skipping Keycloak deletion", email);
        }
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
