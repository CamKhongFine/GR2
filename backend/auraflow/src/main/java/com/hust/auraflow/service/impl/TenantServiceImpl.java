package com.hust.auraflow.service.impl;

import com.hust.auraflow.common.enums.TenantStatus;
import com.hust.auraflow.dto.TenantRequest;
import com.hust.auraflow.dto.TenantResponse;
import com.hust.auraflow.entity.Tenant;
import com.hust.auraflow.repository.TenantRepository;
import com.hust.auraflow.service.TenantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantServiceImpl implements TenantService {

    private final TenantRepository tenantRepository;

    @Override
    @Transactional
    public TenantResponse createTenant(TenantRequest request) {
        Tenant tenant = new Tenant();
        tenant.setName(request.getName());
        tenant.setStatus(TenantStatus.ACTIVE);

        Tenant savedTenant = tenantRepository.save(tenant);

        return TenantResponse.fromEntity(savedTenant);
    }

    @Override
    @Transactional(readOnly = true)
    public TenantResponse getTenantById(Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Tenant not found with ID: {}", id);
                    return new RuntimeException("Tenant not found with ID: " + id);
                });

        return TenantResponse.fromEntity(tenant);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TenantResponse> getAllTenants() {
        return tenantRepository.findAll().stream()
                .map(TenantResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TenantResponse updateTenant(Long id, TenantRequest request) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Tenant not found with ID: {}", id);
                    return new RuntimeException("Tenant not found with ID: " + id);
                });

        tenant.setName(request.getName());
        // Status update is not included in TenantRequest, so we don't update it here

        Tenant updatedTenant = tenantRepository.save(tenant);
        log.info("Successfully updated tenant with ID: {}", id);

        return TenantResponse.fromEntity(updatedTenant);
    }

    @Override
    @Transactional
    public void deleteTenant(Long id) {
        if (!tenantRepository.existsById(id)) {
            log.error("Tenant not found with ID: {}", id);
            throw new RuntimeException("Tenant not found with ID: " + id);
        }

        tenantRepository.deleteById(id);
    }
}

