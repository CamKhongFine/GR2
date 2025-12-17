import apiClient from '../lib/apiClient';
import { RoleResponse } from './role.api';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'INVITED';

export interface UserResponse {
    id: number;
    tenantId: number;
    email: string;
    firstName?: string;
    lastName?: string;
    title?: string;
    avatarUrl?: string;
    roles?: RoleResponse[];
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    title?: string;
    divisionId?: number;
    departmentId?: number;
}

export interface InviteTenantUserRequest {
    email: string;
}

export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

/**
 * Fetch users in the current admin's tenant
 */
export const fetchTenantUsers = async (
    page: number = 0,
    size: number = 10,
    email?: string,
    status?: string,
    roleLevel?: number
): Promise<PagedResponse<UserResponse>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (email) params.append('email', email);
    if (status && status !== 'all') params.append('status', status);
    if (roleLevel !== undefined) params.append('roleLevel', roleLevel.toString());

    const response = await apiClient.get<PagedResponse<UserResponse>>(`/api/admin/users?${params.toString()}`);
    return response.data;
};

/**
 * Invite a user to the current admin's tenant
 */
export const inviteTenantUser = async (data: InviteTenantUserRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/api/admin/users/invite', data);
    return response.data;
};

/**
 * Fetch roles that the current admin can assign (roles with level > admin's level)
 */
export const fetchAvailableRoles = async (): Promise<RoleResponse[]> => {
    const response = await apiClient.get<RoleResponse[]>('/api/admin/users/roles/available');
    return response.data;
};

/**
 * Update a user in the current admin's tenant
 */
export const updateTenantUser = async (id: number, data: UpdateUserRequest): Promise<UserResponse> => {
    const response = await apiClient.put<UserResponse>(`/api/admin/users/${id}`, data);
    return response.data;
};

/**
 * Assign roles to a user in the current admin's tenant
 */
export const assignRolesToTenantUser = async (userId: number, roleIds: number[]): Promise<UserResponse> => {
    const response = await apiClient.put<UserResponse>(`/api/admin/users/${userId}/roles`, { roleIds });
    return response.data;
};

/**
 * Activate a user in the current admin's tenant
 */
export const activateTenantUser = async (id: number): Promise<UserResponse> => {
    const response = await apiClient.put<UserResponse>(`/api/admin/users/${id}/activate`);
    return response.data;
};

/**
 * Deactivate a user in the current admin's tenant
 */
export const deactivateTenantUser = async (id: number): Promise<UserResponse> => {
    const response = await apiClient.put<UserResponse>(`/api/admin/users/${id}/deactivate`);
    return response.data;
};

/**
 * Delete a user in the current admin's tenant
 */
export const deleteTenantUser = async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/users/${id}`);
};
