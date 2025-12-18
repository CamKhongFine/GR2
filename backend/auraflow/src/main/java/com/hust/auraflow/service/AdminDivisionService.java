package com.hust.auraflow.service;

import com.hust.auraflow.dto.CreateDivisionRequest;
import com.hust.auraflow.dto.DepartmentResponse;
import com.hust.auraflow.dto.DivisionResponse;
import com.hust.auraflow.dto.UpdateDivisionRequest;
import com.hust.auraflow.dto.UserResponse;
import com.hust.auraflow.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service for Admin-scoped division management operations.
 */
public interface AdminDivisionService {
    Page<DivisionResponse> getTenantDivisions(UserPrincipal principal, String name, Pageable pageable);
    DivisionResponse getDivisionById(UserPrincipal principal, Long divisionId);
    DivisionResponse createDivision(UserPrincipal principal, CreateDivisionRequest request);
    DivisionResponse updateDivision(UserPrincipal principal, Long divisionId, UpdateDivisionRequest request);
    void deleteDivision(UserPrincipal principal, Long divisionId);
    void assignDepartmentToDivision(UserPrincipal principal, Long divisionId, Long departmentId);
    void removeDepartmentFromDivision(UserPrincipal principal, Long divisionId, Long departmentId);
    void assignMemberToDivision(UserPrincipal principal, Long divisionId, Long userId);
    void removeMemberFromDivision(UserPrincipal principal, Long divisionId, Long userId);
    Page<DepartmentResponse> getDivisionDepartments(UserPrincipal principal, Long divisionId, String name, Pageable pageable);
    Page<UserResponse> getDivisionMembers(UserPrincipal principal, Long divisionId, Long departmentId, String search, Pageable pageable);
}
