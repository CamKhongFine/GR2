package com.hust.auraflow.service;

import com.hust.auraflow.dto.TenantRequest;
import com.hust.auraflow.dto.TenantResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TenantService {
    /**
     * Creates a new tenant.
     * 
     * @param request Tenant creation request
     * @return Created tenant response
     */
    TenantResponse createTenant(TenantRequest request);

    /**
     * Gets a tenant by ID.
     * 
     * @param id Tenant ID
     * @return Tenant response
     */
    TenantResponse getTenantById(Long id);

    /**
     * Gets all tenants with pagination and filtering.
     * 
     * @param id Tenant ID filter
     * @param name Tenant name filter
     * @param status Status filter
     * @param pageable Pagination parameters
     * @return Page of tenant responses
     */
    Page<TenantResponse> getAllTenants(Long id, String name, String status, Pageable pageable);

    /**
     * Updates a tenant.
     * 
     * @param id Tenant ID
     * @param request Tenant update request
     * @return Updated tenant response
     */
    TenantResponse updateTenant(Long id, TenantRequest request);

    /**
     * Deletes a tenant by ID.
     * 
     * @param id Tenant ID
     */
    void deleteTenant(Long id);
}

