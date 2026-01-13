package com.hust.auraflow.service;

import com.hust.auraflow.dto.response.DepartmentResponse;

import java.util.List;

public interface DepartmentService {
    /**
     * Gets departments by tenant ID.
     * 
     * @param tenantId Tenant ID
     * @return List of departments
     */
    List<DepartmentResponse> getDepartmentsByTenant(Long tenantId);
}

