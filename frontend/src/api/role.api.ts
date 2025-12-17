import apiClient from '../lib/apiClient';

export interface RoleResponse {
    id: number;
    name: string;
    level: number;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface RoleRequest {
    name: string;
    level: number;
    description?: string;
}

export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export const fetchRoles = async (
    page: number = 0,
    size: number = 10,
    id?: string,
    name?: string,
    level?: number
): Promise<PagedResponse<RoleResponse>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (id) params.append('id', id);
    if (name) params.append('name', name);
    if (level !== undefined) params.append('level', level.toString());

    const response = await apiClient.get<PagedResponse<RoleResponse>>(`/api/roles?${params.toString()}`);
    return response.data;
};

export const fetchRoleById = async (id: number): Promise<RoleResponse> => {
    const response = await apiClient.get<RoleResponse>(`/api/roles/${id}`);
    return response.data;
};

export const createRole = async (data: RoleRequest): Promise<RoleResponse> => {
    const response = await apiClient.post<RoleResponse>('/api/roles', data);
    return response.data;
};

export const updateRole = async (id: number, data: RoleRequest): Promise<RoleResponse> => {
    const response = await apiClient.put<RoleResponse>(`/api/roles/${id}`, data);
    return response.data;
};

export const deleteRole = async (id: number): Promise<void> => {
    await apiClient.delete(`/api/roles/${id}`);
};
