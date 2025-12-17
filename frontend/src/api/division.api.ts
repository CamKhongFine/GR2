import apiClient from '../lib/apiClient';

export interface DivisionResponse {
    id: number;
    tenantId: number;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDivisionRequest {
    name: string;
    description?: string;
}

export interface UpdateDivisionRequest {
    name?: string;
    description?: string;
}

export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export const fetchTenantDivisions = async (
    page: number = 0,
    size: number = 10,
    name?: string
): Promise<PagedResponse<DivisionResponse>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (name) params.append('name', name);

    const response = await apiClient.get<PagedResponse<DivisionResponse>>(`/api/admin/divisions?${params.toString()}`);
    return response.data;
};

export const createDivision = async (data: CreateDivisionRequest): Promise<DivisionResponse> => {
    const response = await apiClient.post<DivisionResponse>('/api/admin/divisions', data);
    return response.data;
};

export const updateDivision = async (id: number, data: UpdateDivisionRequest): Promise<DivisionResponse> => {
    const response = await apiClient.put<DivisionResponse>(`/api/admin/divisions/${id}`, data);
    return response.data;
};

export const deleteDivision = async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/divisions/${id}`);
};
