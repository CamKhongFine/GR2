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

export const getDivisionById = async (id: number): Promise<DivisionResponse> => {
    const response = await apiClient.get<DivisionResponse>(`/api/admin/divisions/${id}`);
    return response.data;
};

export const assignDepartmentToDivision = async (divisionId: number, departmentId: number): Promise<void> => {
    await apiClient.put(`/api/admin/divisions/${divisionId}/departments/${departmentId}`);
};

export const removeDepartmentFromDivision = async (divisionId: number, departmentId: number): Promise<void> => {
    await apiClient.delete(`/api/admin/divisions/${divisionId}/departments/${departmentId}`);
};

export const assignMemberToDivision = async (divisionId: number, userId: number): Promise<void> => {
    await apiClient.put(`/api/admin/divisions/${divisionId}/members/${userId}`);
};

export const removeMemberFromDivision = async (divisionId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/api/admin/divisions/${divisionId}/members/${userId}`);
};

export const getDivisionDepartments = async (
    divisionId: number,
    page: number = 0,
    size: number = 10,
    name?: string
): Promise<PagedResponse<import('../api/department.api').DepartmentResponse>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (name) params.append('name', name);

    const response = await apiClient.get<PagedResponse<import('../api/department.api').DepartmentResponse>>(
        `/api/admin/divisions/${divisionId}/departments?${params.toString()}`
    );
    return response.data;
};

export const getDivisionMembers = async (
    divisionId: number,
    page: number = 0,
    size: number = 10,
    departmentId?: number,
    search?: string
): Promise<PagedResponse<import('../api/user.api').UserResponse>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (departmentId) params.append('departmentId', departmentId.toString());
    if (search) params.append('search', search);

    const response = await apiClient.get<PagedResponse<import('../api/user.api').UserResponse>>(
        `/api/admin/divisions/${divisionId}/members?${params.toString()}`
    );
    return response.data;
};
