package com.hust.auraflow.service;

import com.hust.auraflow.dto.TenantRequest;
import com.hust.auraflow.dto.TenantResponse;

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
     * Gets all tenants.
     * 
     * @return List of tenant responses
     */
    List<TenantResponse> getAllTenants();

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

