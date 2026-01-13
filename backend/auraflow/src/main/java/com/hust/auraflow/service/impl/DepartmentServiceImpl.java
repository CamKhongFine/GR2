package com.hust.auraflow.service.impl;

import com.hust.auraflow.dto.response.DepartmentResponse;
import com.hust.auraflow.repository.DepartmentRepository;
import com.hust.auraflow.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Override
    public List<DepartmentResponse> getDepartmentsByTenant(Long tenantId) {
        return departmentRepository.findByTenantId(tenantId).stream()
                .map(dept -> DepartmentResponse.builder()
                        .id(dept.getId())
                        .tenantId(dept.getTenantId())
                        .name(dept.getName())
                        .description(dept.getDescription())
                        .build())
                .collect(Collectors.toList());
    }
}

