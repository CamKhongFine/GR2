package com.hust.auraflow.service;

import com.hust.auraflow.dto.CreateDepartmentRequest;
import com.hust.auraflow.dto.DepartmentResponse;
import com.hust.auraflow.dto.UpdateDepartmentRequest;
import com.hust.auraflow.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service for Admin-scoped department management operations.
 * All operations are restricted to the admin's tenant.
 */
public interface AdminDepartmentService {
    
    /**
     * Get all departments in the current admin's tenant with pagination and filters.
     * 
     * @param principal Current admin's principal
     * @param name Name filter (optional)
     * @param pageable Pagination parameters
     * @return Paginated list of departments in the admin's tenant
     */
    Page<DepartmentResponse> getTenantDepartments(
            UserPrincipal principal,
            Long divisionId,
            String name,
            Pageable pageable
    );
    
    /**
     * Create a new department in the current admin's tenant.
     * 
     * @param principal Current admin's principal
     * @param request Create request
     * @return Created department response
     */
    DepartmentResponse createDepartment(UserPrincipal principal, CreateDepartmentRequest request);
    
    /**
     * Update a department in the current admin's tenant.
     * 
     * @param principal Current admin's principal
     * @param departmentId Department ID to update
     * @param request Update request
     * @return Updated department response
     * @throws IllegalArgumentException if department not in admin's tenant
     */
    DepartmentResponse updateDepartment(UserPrincipal principal, Long departmentId, UpdateDepartmentRequest request);
    
    /**
     * Delete a department in the current admin's tenant.
     * 
     * @param principal Current admin's principal
     * @param departmentId Department ID to delete
     * @throws IllegalArgumentException if department not in admin's tenant
     */
    void deleteDepartment(UserPrincipal principal, Long departmentId);
}
