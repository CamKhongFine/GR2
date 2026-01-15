package com.hust.auraflow.service;

import com.hust.auraflow.dto.request.RoleRequest;
import com.hust.auraflow.dto.response.RoleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RoleService {

    Page<RoleResponse> getAllRoles(Long id, String name, Integer level, Pageable pageable);

    RoleResponse getRoleById(Long id);

    RoleResponse createRole(RoleRequest request);

    RoleResponse updateRole(Long id, RoleRequest request);

    void deleteRole(Long id);
}
