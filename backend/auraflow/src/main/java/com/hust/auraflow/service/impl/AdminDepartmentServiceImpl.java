package com.hust.auraflow.service.impl;

import com.hust.auraflow.dto.CreateDepartmentRequest;
import com.hust.auraflow.dto.DepartmentResponse;
import com.hust.auraflow.dto.UpdateDepartmentRequest;
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
            String name,
            Pageable pageable) {
        
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Long tenantId = admin.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Admin user has no tenant");
        }
        
        Page<Department> departments = departmentRepository.findByTenantIdAndFilters(
                tenantId, name, pageable);
        
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

    private DepartmentResponse buildDepartmentResponse(Department department) {
        return DepartmentResponse.builder()
                .id(department.getId())
                .tenantId(department.getTenantId())
                .name(department.getName())
                .description(department.getDescription())
                .createdAt(department.getCreatedAt())
                .updatedAt(department.getUpdatedAt())
                .build();
    }
}
