import apiClient from '../lib/apiClient';

export interface UserResponse {
    id: number;
    tenantId: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    title: string | null;
    avatarUrl: string | null;
    division: DivisionResponse | null;
    department: DepartmentResponse | null;
    roles: RoleResponse[];
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface RoleResponse {
    id: number;
    name: string;
    level: number;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    title?: string;
    divisionId?: number | null;
    departmentId?: number | null;
}

export interface DivisionResponse {
    id: number;
    name: string;
    description: string | null;
}

export interface DepartmentResponse {
    id: number;
    tenantId: number;
    name: string;
    description: string | null;
}

export const fetchCurrentUser = async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>('/api/users/me');
    return response.data;
};

export const updateCurrentUser = async (data: UpdateUserRequest): Promise<UserResponse> => {
    const response = await apiClient.put<UserResponse>('/api/users/me', data);
    return response.data;
};

export const fetchDivisions = async (): Promise<DivisionResponse[]> => {
    const response = await apiClient.get<DivisionResponse[]>('/api/divisions');
    return response.data;
};

export const fetchDepartments = async (): Promise<DepartmentResponse[]> => {
    const response = await apiClient.get<DepartmentResponse[]>('/api/departments');
    return response.data;
};

