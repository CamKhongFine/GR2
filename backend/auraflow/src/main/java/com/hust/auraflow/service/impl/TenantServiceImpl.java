package com.hust.auraflow.service.impl;

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
        log.info("Creating tenant with name: {}", request.getName());

        Tenant tenant = new Tenant();
        tenant.setName(request.getName());
        tenant.setStatus(request.getStatus());

        Tenant savedTenant = tenantRepository.save(tenant);
        log.info("Successfully created tenant with ID: {}", savedTenant.getId());

        return TenantResponse.fromEntity(savedTenant);
    }

    @Override
    @Transactional(readOnly = true)
    public TenantResponse getTenantById(Long id) {
        log.info("Getting tenant by ID: {}", id);

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
        log.info("Getting all tenants");

        return tenantRepository.findAll().stream()
                .map(TenantResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TenantResponse updateTenant(Long id, TenantRequest request) {
        log.info("Updating tenant with ID: {}", id);

        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Tenant not found with ID: {}", id);
                    return new RuntimeException("Tenant not found with ID: " + id);
                });

        tenant.setName(request.getName());
        if (request.getStatus() != null) {
            tenant.setStatus(request.getStatus());
        }

        Tenant updatedTenant = tenantRepository.save(tenant);
        log.info("Successfully updated tenant with ID: {}", id);

        return TenantResponse.fromEntity(updatedTenant);
    }

    @Override
    @Transactional
    public void deleteTenant(Long id) {
        log.info("Deleting tenant with ID: {}", id);

        if (!tenantRepository.existsById(id)) {
            log.error("Tenant not found with ID: {}", id);
            throw new RuntimeException("Tenant not found with ID: " + id);
        }

        tenantRepository.deleteById(id);
        log.info("Successfully deleted tenant with ID: {}", id);
    }
}

