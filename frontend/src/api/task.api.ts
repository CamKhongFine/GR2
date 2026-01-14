import apiClient from '../lib/apiClient';

// Types matching backend DTOs
export type TaskPriority = 'LOW' | 'NORMAL' | 'HIGH';

export interface TaskResponse {
    id: number;
    projectId: number | null;
    projectName: string | null;
    workflowId: number | null;
    workflowName: string | null;
    title: string;
    description: string | null;
    status: string;
    priority: TaskPriority | null;
    currentStepId: number | null;
    currentStepName: string | null;
    creatorId: number | null;
    creatorName: string | null;
    beginDate: string | null;
    endDate: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskRequest {
    projectId: number;
    workflowId: number;
    title: string;
    description?: string;
    priority?: TaskPriority;
    beginDate?: string;
    endDate?: string;
}

export interface UpdateTaskRequest {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    beginDate?: string;
    endDate?: string;
}

export interface PagedTaskResponse {
    content: TaskResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

/**
 * Fetch tasks with optional filters
 */
export const fetchTasks = async (
    page: number = 0,
    size: number = 20,
    projectId?: number,
    title?: string,
    status?: string,
    priority?: TaskPriority
): Promise<PagedTaskResponse> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });
    if (projectId) params.append('projectId', projectId.toString());
    if (title) params.append('title', title);
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);

    const response = await apiClient.get<PagedTaskResponse>(`/api/tasks?${params.toString()}`);
    return response.data;
};

/**
 * Get a single task by ID
 */
export const getTaskById = async (taskId: number): Promise<TaskResponse> => {
    const response = await apiClient.get<TaskResponse>(`/api/tasks/${taskId}`);
    return response.data;
};

/**
 * Create a new task
 */
export const createTask = async (request: CreateTaskRequest): Promise<TaskResponse> => {
    const response = await apiClient.post<TaskResponse>('/api/tasks', request);
    return response.data;
};

/**
 * Update an existing task
 */
export const updateTask = async (taskId: number, request: UpdateTaskRequest): Promise<TaskResponse> => {
    const response = await apiClient.put<TaskResponse>(`/api/tasks/${taskId}`, request);
    return response.data;
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId: number): Promise<void> => {
    await apiClient.delete(`/api/tasks/${taskId}`);
};
