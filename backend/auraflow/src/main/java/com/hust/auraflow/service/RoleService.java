package com.hust.auraflow.service;

import com.hust.auraflow.dto.RoleRequest;
import com.hust.auraflow.dto.RoleResponse;

import java.util.List;

public interface RoleService {

    List<RoleResponse> getAllRoles();

    RoleResponse getRoleById(Long id);

    RoleResponse createRole(RoleRequest request);

    RoleResponse updateRole(Long id, RoleRequest request);

    void deleteRole(Long id);
}


