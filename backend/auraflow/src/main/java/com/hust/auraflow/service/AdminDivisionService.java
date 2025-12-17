package com.hust.auraflow.service;

import com.hust.auraflow.dto.CreateDivisionRequest;
import com.hust.auraflow.dto.DivisionResponse;
import com.hust.auraflow.dto.UpdateDivisionRequest;
import com.hust.auraflow.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service for Admin-scoped division management operations.
 */
public interface AdminDivisionService {
    Page<DivisionResponse> getTenantDivisions(UserPrincipal principal, String name, Pageable pageable);
    DivisionResponse createDivision(UserPrincipal principal, CreateDivisionRequest request);
    DivisionResponse updateDivision(UserPrincipal principal, Long divisionId, UpdateDivisionRequest request);
    void deleteDivision(UserPrincipal principal, Long divisionId);
}
