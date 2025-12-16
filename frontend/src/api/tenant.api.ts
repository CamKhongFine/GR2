import apiClient from '../lib/apiClient';

export type TenantStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface TenantResponse {
    id: number;
    name: string;
    status: TenantStatus;
    createdAt: string;
    updatedAt: string;
}

export interface TenantRequest {
    name: string;
    status?: TenantStatus;
}

export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export const fetchTenants = async (
    page: number = 0,
    size: number = 10,
    id?: string,
    name?: string,
    status?: string
): Promise<PagedResponse<TenantResponse>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (id) params.append('id', id);
    if (name) params.append('name', name);
    if (status && status !== 'all') params.append('status', status);

    const response = await apiClient.get<PagedResponse<TenantResponse>>(`/api/tenants?${params.toString()}`);
    return response.data;
};

export const fetchTenantById = async (id: number): Promise<TenantResponse> => {
    const response = await apiClient.get<TenantResponse>(`/api/tenants/${id}`);
    return response.data;
};

export const createTenant = async (data: TenantRequest): Promise<TenantResponse> => {
    const response = await apiClient.post<TenantResponse>('/api/tenants', data);
    return response.data;
};

export const updateTenant = async (id: number, data: TenantRequest): Promise<TenantResponse> => {
    const response = await apiClient.put<TenantResponse>(`/api/tenants/${id}`, data);
    return response.data;
};

export const deactivateTenant = async (tenant: TenantResponse): Promise<TenantResponse> => {
    const response = await apiClient.put<TenantResponse>(`/api/tenants/${tenant.id}`, {
        name: tenant.name,
        status: 'INACTIVE'
    });
    return response.data;
};

export const activateTenant = async (tenant: TenantResponse): Promise<TenantResponse> => {
    const response = await apiClient.put<TenantResponse>(`/api/tenants/${tenant.id}`, {
        name: tenant.name,
        status: 'ACTIVE'
    });
    return response.data;
};

export const deleteTenant = async (id: number): Promise<void> => {
    await apiClient.delete(`/api/tenants/${id}`);
};
