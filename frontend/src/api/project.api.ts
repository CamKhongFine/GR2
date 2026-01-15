import apiClient from '../lib/apiClient';

export enum ProjectStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    CLOSED = 'CLOSED',
    ON_HOLD = 'ON_HOLD',
}

export interface ProjectResponse {
    id: number;
    name: string;
    description: string | null;
    status: ProjectStatus;
    departmentId: number;
    departmentName: string;
    divisionId: number;
    divisionName: string;
    createdById: number;
    createdByName: string;
    beginDate: string | null;
    endDate: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProjectRequest {
    departmentId: number;
    name: string;
    description?: string;
    beginDate?: string;
    endDate?: string;
}

export interface UpdateProjectRequest {
    name?: string;
    description?: string;
    status?: ProjectStatus;
    beginDate?: string;
    endDate?: string;
}

export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export const fetchProjects = async (
    page: number = 0,
    size: number = 10,
    departmentId?: number,
    name?: string,
    status?: string
): Promise<PagedResponse<ProjectResponse>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (departmentId) params.append('departmentId', departmentId.toString());
    if (name) params.append('name', name);
    if (status) params.append('status', status);

    const response = await apiClient.get<PagedResponse<ProjectResponse>>(`/api/projects?${params.toString()}`);
    return response.data;
};

export const getProjectById = async (id: number): Promise<ProjectResponse> => {
    const response = await apiClient.get<ProjectResponse>(`/api/projects/${id}`);
    return response.data;
};

export const createProject = async (data: CreateProjectRequest): Promise<ProjectResponse> => {
    const response = await apiClient.post<ProjectResponse>('/api/projects', data);
    return response.data;
};

export const updateProject = async (id: number, data: UpdateProjectRequest): Promise<ProjectResponse> => {
    const response = await apiClient.put<ProjectResponse>(`/api/projects/${id}`, data);
    return response.data;
};

export const deleteProject = async (id: number): Promise<void> => {
    await apiClient.delete(`/api/projects/${id}`);
};
