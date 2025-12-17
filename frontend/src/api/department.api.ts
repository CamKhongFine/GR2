import apiClient from '../lib/apiClient';

export interface DepartmentResponse {
    id: number;
    tenantId: number;
    name: string;
    description?: string;
    divisionId?: number;
    divisionName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDepartmentRequest {
    name: string;
    description?: string;
    divisionId?: number;
}

export interface UpdateDepartmentRequest {
    name?: string;
    description?: string;
    divisionId?: number;
}

export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

/**
 * Fetch departments in the current admin's tenant
 */
export const fetchTenantDepartments = async (
    page: number = 0,
    size: number = 10,
    name?: string,
    divisionId?: number
): Promise<PagedResponse<DepartmentResponse>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (name) params.append('name', name);
    if (divisionId) params.append('divisionId', divisionId.toString());

    const response = await apiClient.get<PagedResponse<DepartmentResponse>>(`/api/admin/departments?${params.toString()}`);
    return response.data;
};

/**
 * Create a new department in the current admin's tenant
 */
export const createDepartment = async (data: CreateDepartmentRequest): Promise<DepartmentResponse> => {
    const response = await apiClient.post<DepartmentResponse>('/api/admin/departments', data);
    return response.data;
};

/**
 * Update a department in the current admin's tenant
 */
export const updateDepartment = async (id: number, data: UpdateDepartmentRequest): Promise<DepartmentResponse> => {
    const response = await apiClient.put<DepartmentResponse>(`/api/admin/departments/${id}`, data);
    return response.data;
};

/**
 * Delete a department in the current admin's tenant
 */
export const deleteDepartment = async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/departments/${id}`);
};
