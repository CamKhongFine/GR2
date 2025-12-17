package com.hust.auraflow.service.impl;

import com.hust.auraflow.dto.CreateDivisionRequest;
import com.hust.auraflow.dto.DivisionResponse;
import com.hust.auraflow.dto.UpdateDivisionRequest;
import com.hust.auraflow.entity.Division;
import com.hust.auraflow.entity.User;
import com.hust.auraflow.repository.DivisionRepository;
import com.hust.auraflow.repository.UserRepository;
import com.hust.auraflow.security.UserPrincipal;
import com.hust.auraflow.service.AdminDivisionService;
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
public class AdminDivisionServiceImpl implements AdminDivisionService {

    private final DivisionRepository divisionRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<DivisionResponse> getTenantDivisions(
            UserPrincipal principal,
            String name,
            Pageable pageable) {
        
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Long tenantId = admin.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Admin user has no tenant");
        }
        
        Page<Division> divisions = divisionRepository.findByTenantIdAndFilters(
                tenantId, name, pageable);
        
        return divisions.map(this::buildDivisionResponse);
    }

    @Override
    @Transactional
    public DivisionResponse createDivision(UserPrincipal principal, CreateDivisionRequest request) {
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Long tenantId = admin.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Admin user has no tenant");
        }
        
        Division division = new Division();
        division.setTenantId(tenantId);
        division.setName(request.getName());
        division.setDescription(request.getDescription());
        division.setCreatedAt(Instant.now());
        division.setUpdatedAt(Instant.now());
        
        Division savedDivision = divisionRepository.save(division);
        log.info("Admin {} created division {} in tenant {}", 
                principal.getUserId(), savedDivision.getId(), tenantId);
        
        return buildDivisionResponse(savedDivision);
    }

    @Override
    @Transactional
    public DivisionResponse updateDivision(
            UserPrincipal principal,
            Long divisionId,
            UpdateDivisionRequest request) {
        
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Division division = divisionRepository.findById(divisionId)
                .orElseThrow(() -> new IllegalArgumentException("Division not found"));
        
        if (!division.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("Division does not belong to your tenant");
        }
        
        if (request.getName() != null) {
            division.setName(request.getName());
        }
        if (request.getDescription() != null) {
            division.setDescription(request.getDescription());
        }
        division.setUpdatedAt(Instant.now());
        
        Division updatedDivision = divisionRepository.save(division);
        log.info("Admin {} updated division {}", principal.getUserId(), divisionId);
        
        return buildDivisionResponse(updatedDivision);
    }

    @Override
    @Transactional
    public void deleteDivision(UserPrincipal principal, Long divisionId) {
        User admin = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Division division = divisionRepository.findById(divisionId)
                .orElseThrow(() -> new IllegalArgumentException("Division not found"));
        
        if (!division.getTenantId().equals(admin.getTenantId())) {
            throw new IllegalArgumentException("Division does not belong to your tenant");
        }
        
        divisionRepository.deleteById(divisionId);
        log.info("Admin {} deleted division {}", principal.getUserId(), divisionId);
    }

    private DivisionResponse buildDivisionResponse(Division division) {
        return DivisionResponse.builder()
                .id(division.getId())
                .tenantId(division.getTenantId())
                .name(division.getName())
                .description(division.getDescription())
                .createdAt(division.getCreatedAt())
                .updatedAt(division.getUpdatedAt())
                .build();
    }
}
