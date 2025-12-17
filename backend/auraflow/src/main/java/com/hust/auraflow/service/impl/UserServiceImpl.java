package com.hust.auraflow.service.impl;

import com.hust.auraflow.common.enums.UserStatus;
import com.hust.auraflow.dto.*;
import com.hust.auraflow.entity.Department;
import com.hust.auraflow.entity.Division;
import com.hust.auraflow.entity.User;
import com.hust.auraflow.entity.UserRole;
import com.hust.auraflow.repository.DepartmentRepository;
import com.hust.auraflow.repository.DivisionRepository;
import com.hust.auraflow.repository.UserRepository;
import com.hust.auraflow.repository.UserRoleRepository;
import com.hust.auraflow.security.UserPrincipal;
import com.hust.auraflow.service.RabbitMQProducer;
import com.hust.auraflow.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final DivisionRepository divisionRepository;
    private final DepartmentRepository departmentRepository;
    private final RabbitMQProducer rabbitMQProducer;

    @Override
    @Transactional
    public UserResponse getCurrentUser(UserPrincipal principal) {
        if (principal == null || principal.getUserId() == null) {
            throw new IllegalArgumentException("UserPrincipal is required");
        }

        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new IllegalStateException("User is not active");
        }
        
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

    @Override
    @Transactional
    public UserResponse updateCurrentUser(UserPrincipal principal, UpdateUserRequest request) {
        if (principal == null || principal.getUserId() == null) {
            log.warn("UserPrincipal is null or userId is null");
            throw new IllegalArgumentException("UserPrincipal is required");
        }

        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> {
                    log.error("User not found in database for userId: {}", principal.getUserId());
                    return new RuntimeException("User not found");
                });

        if (user.getStatus() != UserStatus.ACTIVE) {
            log.warn("User status is not ACTIVE for userId: {}", principal.getUserId());
            throw new IllegalStateException("User is not active");
        }

        // Update fields if provided
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
        } else if (request.getDivisionId() == null && user.getDivision() != null) {
            // Allow clearing division
            user.setDivision(null);
        }
        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found"));
            // Verify department belongs to user's tenant
            if (!department.getTenantId().equals(user.getTenantId())) {
                throw new IllegalArgumentException("Department does not belong to user's tenant");
            }
            user.setDepartment(department);
        } else if (request.getDepartmentId() == null && user.getDepartment() != null) {
            // Allow clearing department
            user.setDepartment(null);
        }

        user = userRepository.save(user);

        // Fetch updated roles
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
                .division(divisionResponse)
                .department(departmentResponse)
                .roles(roles)
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }    
    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Long id, String email, String status, Long tenantId, Pageable pageable) {
        Page<User> users = userRepository.findByFilters(id, email, status, tenantId, pageable);
        return users.map(this::buildUserResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new RuntimeException("User not found with ID: " + id);
                });
        return buildUserResponse(user);
    }
    
    @Override
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new RuntimeException("User not found with ID: " + id);
                });
        
        // Update fields if provided
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
        log.info("Updated user with id {}", updatedUser.getId());
        return buildUserResponse(updatedUser);
    }
    
    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new RuntimeException("User not found with ID: " + id);
                });
        
        String keycloakSub = user.getKeycloakSub();
        String email = user.getEmail();
        
        // Delete from database first
        userRepository.deleteById(id);
        log.info("Deleted user from database with id {}", id);
        
        // Send message to RabbitMQ to delete from Keycloak asynchronously
        if (keycloakSub != null && !keycloakSub.isEmpty()) {
            rabbitMQProducer.publishDeleteUserMessage(keycloakSub, email);
            log.info("Published delete user message to RabbitMQ for keycloakSub={}", keycloakSub);
        } else {
            log.warn("User {} has no Keycloak sub, skipping Keycloak deletion", email);
        }
    }
    
    @Override
    @Transactional
    public UserResponse activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new RuntimeException("User not found with ID: " + id);
                });
        
        user.setStatus(UserStatus.ACTIVE);
        User updatedUser = userRepository.save(user);
        log.info("Activated user with id {}", updatedUser.getId());
        return buildUserResponse(updatedUser);
    }
    
    @Override
    @Transactional
    public UserResponse deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new RuntimeException("User not found with ID: " + id);
                });
        
        user.setStatus(UserStatus.INACTIVE);
        User updatedUser = userRepository.save(user);
        log.info("Deactivated user with id {}", updatedUser.getId());
        return buildUserResponse(updatedUser);
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
