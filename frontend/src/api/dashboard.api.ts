import apiClient from '../lib/apiClient';

export interface DashboardStats {
    totalTenants: number;
    totalUsers: number;
    activeUsers: number;
    totalRoles: number;
    usersByTenant: TenantUserCount[];
    usersByStatus: UserStatusCount[];
}

export interface TenantUserCount {
    tenantId: number;
    tenantName: string;
    userCount: number;
}

export interface UserStatusCount {
    status: string;
    count: number;
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/api/dashboard/stats');
    return response.data;
};
