package com.hust.auraflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private Long totalTenants;
    private Long totalUsers;
    private Long activeUsers;
    private Long totalRoles;
    private List<TenantUserCount> usersByTenant;
    private List<UserStatusCount> usersByStatus;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TenantUserCount {
        private Long tenantId;
        private String tenantName;
        private Long userCount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStatusCount {
        private String status;
        private Long count;
    }
}
