import apiClient from '../lib/apiClient';
import { UserResponse } from './user.api';

export interface AssignRolesRequest {
    userId: number;
    roleIds: number[];
}

export const assignRolesToUser = async (data: AssignRolesRequest): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>('/api/user-roles/assign', data);
    return response.data;
};

export const unassignRoleFromUser = async (userId: number, roleId: number): Promise<UserResponse> => {
    const response = await apiClient.delete<UserResponse>(`/api/user-roles/${userId}/roles/${roleId}`);
    return response.data;
};

export const getUserRoles = async (userId: number): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(`/api/user-roles/${userId}`);
    return response.data;
};
