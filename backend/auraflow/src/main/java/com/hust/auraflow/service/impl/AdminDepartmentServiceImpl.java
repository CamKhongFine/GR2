package com.hust.auraflow.service.impl;

import com.hust.auraflow.dto.*;
import com.hust.auraflow.entity.Department;
import com.hust.auraflow.entity.Division;
import com.hust.auraflow.entity.User;
import com.hust.auraflow.repository.DepartmentRepository;
import com.hust.auraflow.repository.DivisionRepository;
import com.hust.auraflow.repository.UserRepository;
import com.hust.auraflow.security.UserPrincipal;
import com.hust.auraflow.service.AdminDepartmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminDepartmentServiceImpl implements AdminDepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DivisionRepository divisionRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<DepartmentResponse> getTenantDepartments(
            UserPrincipal principal,
            Long divisionId,
            String name,
            Pageable pageable) {
        
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Long tenantId = admin.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Admin user has no tenant");
        }
        
        Page<Department> departments = departmentRepository.findByTenantIdAndFilters(
                tenantId, divisionId, name, pageable);
        
        return departments.map(this::buildDepartmentResponse);
    }

    @Override
    @Transactional
    public DepartmentResponse createDepartment(UserPrincipal principal, CreateDepartmentRequest request) {
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Long tenantId = admin.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Admin user has no tenant");
        }
        
        Department department = new Department();
        department.setTenantId(tenantId);
        department.setName(request.getName());
        department.setDescription(request.getDescription());
        
        if (request.getDivisionId() != null) {
            Division division = divisionRepository.findById(request.getDivisionId())
                    .orElseThrow(() -> new IllegalArgumentException("Division not found"));
            
            if (!division.getTenantId().equals(tenantId)) {
                throw new IllegalArgumentException("Division does not belong to your tenant");
            }
            department.setDivision(division);
        }
        
        department.setCreatedAt(Instant.now());
        department.setUpdatedAt(Instant.now());
        
        Department savedDepartment = departmentRepository.save(department);
        log.info("Admin {} created department {} in tenant {}", 
                principal.getUserId(), savedDepartment.getId(), tenantId);
        
        return buildDepartmentResponse(savedDepartment);
    }

    @Override
    @Transactional
    public DepartmentResponse updateDepartment(
            UserPrincipal principal,
            Long departmentId,
            UpdateDepartmentRequest request) {
        
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        
        if (!department.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("Department does not belong to your tenant");
        }
        
        if (request.getName() != null) {
            department.setName(request.getName());
        }
        if (request.getDescription() != null) {
            department.setDescription(request.getDescription());
        }
        if (request.getDivisionId() != null) {
            Division division = divisionRepository.findById(request.getDivisionId())
                    .orElseThrow(() -> new IllegalArgumentException("Division not found"));
            
            if (!division.getTenantId().equals(admin.getTenantId())) {
                throw new IllegalArgumentException("Division does not belong to your tenant");
            }
            department.setDivision(division);
        }
        department.setUpdatedAt(Instant.now());
        
        Department updatedDepartment = departmentRepository.save(department);
        log.info("Admin {} updated department {}", principal.getUserId(), departmentId);
        
        return buildDepartmentResponse(updatedDepartment);
    }

    @Override
    @Transactional
    public void deleteDepartment(UserPrincipal principal, Long departmentId) {
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        
        if (!department.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("Department does not belong to your tenant");
        }
        
        departmentRepository.deleteById(departmentId);
        log.info("Admin {} deleted department {}", principal.getUserId(), departmentId);
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(UserPrincipal principal, Long departmentId) {
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        
        if (!department.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("Department does not belong to your tenant");
        }
        
        return buildDepartmentResponse(department);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getDepartmentMembers(
            UserPrincipal principal,
            Long departmentId,
            String search,
            Pageable pageable) {
        
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        
        if (!department.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("Department does not belong to your tenant");
        }
        
        Page<User> users = userRepository.findByDepartmentIdAndFilters(
                admin.getTenantId(), departmentId, search, pageable);
        
        return users.map(this::buildUserResponse);
    }

    @Override
    @Transactional
    public void assignMemberToDepartment(UserPrincipal principal, Long departmentId, Long userId) {
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (!department.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("Department does not belong to your tenant");
        }
        if (!user.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("User does not belong to your tenant");
        }
        
        if (user.getDepartment() != null && !user.getDepartment().getId().equals(departmentId)) {
            throw new IllegalArgumentException("User is already assigned to another department");
        }
        
        user.setDepartment(department);
        userRepository.save(user);
        log.info("Admin {} assigned user {} to department {}", principal.getUserId(), userId, departmentId);
    }

    @Override
    @Transactional
    public void removeMemberFromDepartment(UserPrincipal principal, Long departmentId, Long userId) {
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (!user.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("User does not belong to your tenant");
        }
        
        user.setDepartment(null);
        userRepository.save(user);
        log.info("Admin {} removed user {} from department {}", principal.getUserId(), userId, departmentId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAvailableUsersForDepartment(
            UserPrincipal principal,
            Long departmentId,
            String search,
            Pageable pageable) {
        
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        
        if (!department.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("Department does not belong to your tenant");
        }
        
        if (department.getDivision() == null) {
            throw new IllegalArgumentException("Department must belong to a division");
        }
        
        Page<User> users = userRepository.findAvailableUsersForDepartment(
                admin.getTenantId(), department.getDivision().getId(), search, pageable);
        
        return users.map(this::buildUserResponse);
    }

    private UserResponse buildUserResponse(User user) {
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
                .roles(null) // Not needed for department members list
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private DepartmentResponse buildDepartmentResponse(Department department) {
        return DepartmentResponse.builder()
                .id(department.getId())
                .tenantId(department.getTenantId())
                .name(department.getName())
                .description(department.getDescription())
                .divisionId(department.getDivision() != null ? department.getDivision().getId() : null)
                .divisionName(department.getDivision() != null ? department.getDivision().getName() : null)
                .createdAt(department.getCreatedAt())
                .updatedAt(department.getUpdatedAt())
                .build();
    }
}
