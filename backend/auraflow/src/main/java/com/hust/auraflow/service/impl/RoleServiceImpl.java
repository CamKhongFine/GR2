package com.hust.auraflow.service.impl;

import com.hust.auraflow.dto.request.RoleRequest;
import com.hust.auraflow.dto.response.RoleResponse;
import com.hust.auraflow.entity.Role;
import com.hust.auraflow.repository.RoleRepository;
import com.hust.auraflow.service.RoleService;
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
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<RoleResponse> getAllRoles(Long id, String name, Integer level, Pageable pageable) {
        Page<Role> roles = roleRepository.findByFilters(id, name, level, pageable);
        return roles.map(RoleResponse::fromEntity);
    }

    @Override
    public RoleResponse getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with id: " + id));
        return RoleResponse.fromEntity(role);
    }

    @Override
    public RoleResponse createRole(RoleRequest request) {
        Role role = new Role();
        role.setName(request.getName());
        role.setLevel(request.getLevel());
        role.setDescription(request.getDescription());
        role.setCreatedAt(Instant.now());
        role.setUpdatedAt(Instant.now());

        Role saved = roleRepository.save(role);
        log.info("Created role with id {}", saved.getId());
        return RoleResponse.fromEntity(saved);
    }

    @Override
    public RoleResponse updateRole(Long id, RoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with id: " + id));

        role.setName(request.getName());
        role.setLevel(request.getLevel());
        role.setDescription(request.getDescription());
        role.setUpdatedAt(Instant.now());

        Role updated = roleRepository.save(role);
        log.info("Updated role with id {}", updated.getId());
        return RoleResponse.fromEntity(updated);
    }

    @Override
    public void deleteRole(Long id) {
        if (!roleRepository.existsById(id)) {
            throw new IllegalArgumentException("Role not found with id: " + id);
        }
        roleRepository.deleteById(id);
        log.info("Deleted role with id {}", id);
    }
}


