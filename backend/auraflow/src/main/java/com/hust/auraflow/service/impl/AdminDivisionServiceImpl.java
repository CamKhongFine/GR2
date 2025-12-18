package com.hust.auraflow.service.impl;

import com.hust.auraflow.dto.*;
import com.hust.auraflow.entity.Department;
import com.hust.auraflow.entity.Division;
import com.hust.auraflow.entity.User;
import com.hust.auraflow.repository.DepartmentRepository;
import com.hust.auraflow.repository.DivisionRepository;
import com.hust.auraflow.repository.UserRepository;
import com.hust.auraflow.security.UserPrincipal;
import com.hust.auraflow.service.AdminDivisionService;
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
public class AdminDivisionServiceImpl implements AdminDivisionService {

    private final DivisionRepository divisionRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<DivisionResponse> getTenantDivisions(
            UserPrincipal principal,
            String name,
            Pageable pageable) {
        
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Long tenantId = admin.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Admin user has no tenant");
        }
        
        Page<Division> divisions = divisionRepository.findByTenantIdAndFilters(
                tenantId, name, pageable);
        
        return divisions.map(this::buildDivisionResponse);
    }

    @Override
    @Transactional
    public DivisionResponse createDivision(UserPrincipal principal, CreateDivisionRequest request) {
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Long tenantId = admin.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Admin user has no tenant");
        }
        
        Division division = new Division();
        division.setTenantId(tenantId);
        division.setName(request.getName());
        division.setDescription(request.getDescription());
        division.setCreatedAt(Instant.now());
        division.setUpdatedAt(Instant.now());
        
        Division savedDivision = divisionRepository.save(division);
        log.info("Admin {} created division {} in tenant {}", 
                principal.getUserId(), savedDivision.getId(), tenantId);
        
        return buildDivisionResponse(savedDivision);
    }

    @Override
    @Transactional
    public DivisionResponse updateDivision(
            UserPrincipal principal,
            Long divisionId,
            UpdateDivisionRequest request) {
        
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Division division = divisionRepository.findById(divisionId)
                .orElseThrow(() -> new IllegalArgumentException("Division not found"));
        
        if (!division.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("Division does not belong to your tenant");
        }
        
        if (request.getName() != null) {
            division.setName(request.getName());
        }
        if (request.getDescription() != null) {
            division.setDescription(request.getDescription());
        }
        division.setUpdatedAt(Instant.now());
        
        Division updatedDivision = divisionRepository.save(division);
        log.info("Admin {} updated division {}", principal.getUserId(), divisionId);
        
        return buildDivisionResponse(updatedDivision);
    }

    @Override
    @Transactional
    public void deleteDivision(UserPrincipal principal, Long divisionId) {
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Division division = divisionRepository.findById(divisionId)
                .orElseThrow(() -> new IllegalArgumentException("Division not found"));
        
        if (!division.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("Division does not belong to your tenant");
        }
        
        divisionRepository.deleteById(divisionId);
        log.info("Admin {} deleted division {}", principal.getUserId(), divisionId);
    }

    @Override
    @Transactional(readOnly = true)
    public DivisionResponse getDivisionById(UserPrincipal principal, Long divisionId) {
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Division division = divisionRepository.findById(divisionId)
                .orElseThrow(() -> new IllegalArgumentException("Division not found"));
        
        if (!division.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("Division does not belong to your tenant");
        }
        
        return buildDivisionResponse(division);
    }

    @Override
    @Transactional
    public void assignDepartmentToDivision(UserPrincipal principal, Long divisionId, Long departmentId) {
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Division division = divisionRepository.findById(divisionId)
                .orElseThrow(() -> new IllegalArgumentException("Division not found"));
        
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        
        if (!division.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("Division does not belong to your tenant");
        }
        if (!department.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("Department does not belong to your tenant");
        }
        
        if (department.getDivision() != null && !department.getDivision().getId().equals(divisionId)) {
            throw new IllegalArgumentException("Department is already assigned to another division");
        }
        
        department.setDivision(division);
        departmentRepository.save(department);
    }

    @Override
    @Transactional
    public void removeDepartmentFromDivision(UserPrincipal principal, Long divisionId, Long departmentId) {
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        
        if (!department.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("Department does not belong to your tenant");
        }
        
        department.setDivision(null);
        departmentRepository.save(department);
    }

    @Override
    @Transactional
    public void assignMemberToDivision(UserPrincipal principal, Long divisionId, Long userId) {
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Division division = divisionRepository.findById(divisionId)
                .orElseThrow(() -> new IllegalArgumentException("Division not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (!division.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("Division does not belong to your tenant");
        }
        if (!user.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("User does not belong to your tenant");
        }
        
        if (user.getDivision() != null && !user.getDivision().getId().equals(divisionId)) {
            throw new IllegalArgumentException("User is already assigned to another division");
        }
        
        user.setDivision(division);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void removeMemberFromDivision(UserPrincipal principal, Long divisionId, Long userId) {
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (!user.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("User does not belong to your tenant");
        }
        
        user.setDivision(null);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DepartmentResponse>getDivisionDepartments(
            UserPrincipal principal,
            Long divisionId,
            String name,
            Pageable pageable) {
        
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Division division = divisionRepository.findById(divisionId)
                .orElseThrow(() -> new IllegalArgumentException("Division not found"));
        
        if (!division.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("Division does not belong to your tenant");
        }
        
        Page<Department> departments = departmentRepository.findByTenantIdAndFilters(
                admin.getTenantId(), divisionId, name, pageable);
        
        return departments.map(this::buildDepartmentResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getDivisionMembers(
            UserPrincipal principal,
            Long divisionId,
            Long departmentId,
            String search,
            Pageable pageable) {
        
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Division division = divisionRepository.findById(divisionId)
                .orElseThrow(() -> new IllegalArgumentException("Division not found"));
        
        if (!division.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("Division does not belong to your tenant");
        }
        
        Page<User> users = userRepository.findByDivisionIdAndFilters(
                admin.getTenantId(), divisionId, departmentId, search, pageable);
        
        return users.map(this::buildUserResponse);
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
                .roles(null) // Not needed for division members list
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private DivisionResponse buildDivisionResponse(Division division) {
        return DivisionResponse.builder()
                .id(division.getId())
                .tenantId(division.getTenantId())
                .name(division.getName())
                .description(division.getDescription())
                .createdAt(division.getCreatedAt())
                .updatedAt(division.getUpdatedAt())
                .build();
    }
}
