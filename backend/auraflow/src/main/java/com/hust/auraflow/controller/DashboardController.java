package com.hust.auraflow.controller;

import com.hust.auraflow.common.enums.UserStatus;
import com.hust.auraflow.dto.response.DashboardStatsResponse;
import com.hust.auraflow.entity.Tenant;
import com.hust.auraflow.repository.RoleRepository;
import com.hust.auraflow.repository.TenantRepository;
import com.hust.auraflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final RoleRepository roleRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        log.info("Fetching dashboard statistics");

        // Get total counts
        long totalTenants = tenantRepository.count();
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus(UserStatus.ACTIVE);
        long totalRoles = roleRepository.count();

        // Get users by tenant
        List<Tenant> allTenants = tenantRepository.findAll();
        List<DashboardStatsResponse.TenantUserCount> usersByTenant = allTenants.stream()
                .map(tenant -> DashboardStatsResponse.TenantUserCount.builder()
                        .tenantId(tenant.getId())
                        .tenantName(tenant.getName())
                        .userCount(userRepository.countByTenantId(tenant.getId()))
                        .build())
                .collect(Collectors.toList());

        // Get users by status
        List<DashboardStatsResponse.UserStatusCount> usersByStatus = List.of(
                DashboardStatsResponse.UserStatusCount.builder()
                        .status("ACTIVE")
                        .count(userRepository.countByStatus(UserStatus.ACTIVE))
                        .build(),
                DashboardStatsResponse.UserStatusCount.builder()
                        .status("INACTIVE")
                        .count(userRepository.countByStatus(UserStatus.INACTIVE))
                        .build(),
                DashboardStatsResponse.UserStatusCount.builder()
                        .status("INVITED")
                        .count(userRepository.countByStatus(UserStatus.INVITED))
                        .build()
        );

        DashboardStatsResponse response = DashboardStatsResponse.builder()
                .totalTenants(totalTenants)
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .totalRoles(totalRoles)
                .usersByTenant(usersByTenant)
                .usersByStatus(usersByStatus)
                .build();

        return ResponseEntity.ok(response);
    }
}
