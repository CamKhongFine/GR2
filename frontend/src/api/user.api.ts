import apiClient from '../lib/apiClient';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface UserResponse {
    id: number;
    tenantId: number;
    email: string;
    firstName?: string;
    lastName?: string;
    title?: string;
    avatarUrl?: string;
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

export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export const fetchUsers = async (
    page: number = 0,
    size: number = 10,
    id?: string,
    email?: string,
    status?: string,
    tenantId?: number
): Promise<PagedResponse<UserResponse>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (id) params.append('id', id);
    if (email) params.append('email', email);
    if (status && status !== 'all') params.append('status', status);
    if (tenantId !== undefined) params.append('tenantId', tenantId.toString());

    const response = await apiClient.get<PagedResponse<UserResponse>>(`/api/users?${params.toString()}`);
    return response.data;
};

export const fetchUserById = async (id: number): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(`/api/users/${id}`);
    return response.data;
};

export const updateUser = async (id: number, data: UpdateUserRequest): Promise<UserResponse> => {
    const response = await apiClient.put<UserResponse>(`/api/users/${id}`, data);
    return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
    await apiClient.delete(`/api/users/${id}`);
};

export const activateUser = async (id: number): Promise<UserResponse> => {
    const response = await apiClient.put<UserResponse>(`/api/users/${id}/activate`);
    return response.data;
};

export const deactivateUser = async (id: number): Promise<UserResponse> => {
    const response = await apiClient.put<UserResponse>(`/api/users/${id}/deactivate`);
    return response.data;
};
