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
    divisionId?: number | null,
    name?: string
): Promise<PagedResponse<DepartmentResponse>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (name) params.append('name', name);
    if (divisionId !== undefined) {
        if (divisionId === null) {
            params.append('divisionId', 'null');
        } else {
            params.append('divisionId', divisionId.toString());
        }
    }

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

/**
 * Get department by ID
 */
export const getDepartmentById = async (id: number): Promise<DepartmentResponse> => {
    const response = await apiClient.get<DepartmentResponse>(`/api/admin/departments/${id}`);
    return response.data;
};

/**
 * Get paginated members of a department
 */
export const getDepartmentMembers = async (
    departmentId: number,
    page: number = 0,
    size: number = 10,
    search?: string
): Promise<PagedResponse<import('../api/user.api').UserResponse>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (search) params.append('search', search);

    const response = await apiClient.get<PagedResponse<import('../api/user.api').UserResponse>>(
        `/api/admin/departments/${departmentId}/members?${params.toString()}`
    );
    return response.data;
};

/**
 * Assign a user to a department
 */
export const assignMemberToDepartment = async (departmentId: number, userId: number): Promise<void> => {
    await apiClient.put(`/api/admin/departments/${departmentId}/members/${userId}`);
};

/**
 * Remove a user from a department
 */
export const removeMemberFromDepartment = async (departmentId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/api/admin/departments/${departmentId}/members/${userId}`);
};

/**
 * Get available users for department assignment
 * Returns users in the same division as the department but not assigned to any department
 */
export const getAvailableUsersForDepartment = async (
    departmentId: number,
    page: number = 0,
    size: number = 100,
    search?: string
): Promise<PagedResponse<import('../api/user.api').UserResponse>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (search) params.append('search', search);

    const response = await apiClient.get<PagedResponse<import('../api/user.api').UserResponse>>(
        `/api/admin/departments/${departmentId}/available-users?${params.toString()}`
    );
    return response.data;
};
