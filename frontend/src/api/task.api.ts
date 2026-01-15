import apiClient from '../lib/apiClient';

// Types matching backend DTOs
export type TaskPriority = 'LOW' | 'NORMAL' | 'HIGH';
export type TaskStatus = 'RUNNING' | 'COMPLETED' | 'CANCELLED';

export interface TaskResponse {
    id: number;
    projectId: number | null;
    projectName: string | null;
    workflowId: number | null;
    workflowName: string | null;
    title: string;
    description: string | null;
    status: TaskStatus;
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

export interface StepAssignment {
    workflowStepId: number;
    assigneeId: number;
    priority?: TaskPriority;
}

export interface CreateTaskRequest {
    projectId: number;
    workflowId: number;
    title: string;
    description?: string;
    priority?: TaskPriority;
    beginDate?: string;
    endDate?: string;
    stepAssignments?: StepAssignment[];
}

export interface UpdateTaskRequest {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    projectId?: number;
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
    priority?: TaskPriority,
    creatorId?: number
): Promise<PagedTaskResponse> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });
    if (projectId) params.append('projectId', projectId.toString());
    if (title) params.append('title', title);
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (creatorId) params.append('creatorId', creatorId.toString());

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

// StepTask types and APIs
export interface StepTaskResponse {
    id: number;
    taskId: number;
    taskTitle: string | null;
    projectName?: string | null;
    workflowStepId: number;
    workflowStepName: string;
    stepSequence: number;
    status: string;
    assignedUserId: number | null;
    assignedUserName: string | null;
    creatorId?: number | null;
    creatorName?: string | null;
    priority?: 'LOW' | 'NORMAL' | 'HIGH';
    beginDate: string | null;
    endDate: string | null;
    note: string | null;
}

export interface StepTaskActionResponse {
    id: number;
    taskId: number;
    stepTaskId: number;
    fromStepId: number;
    fromStepName: string;
    toStepId: number | null;
    toStepName: string | null;
    actionName: string;
    actorId: number;
    actorName: string;
    comment: string | null;
    createdAt: string;
}

export interface ExecuteActionRequest {
    actionName: string;
    comment?: string;
    dataBody?: string;
    files?: FileUploadRequest[];
}

export interface FileUploadRequest {
    fileName: string;
    objectName: string;
    fileSize: number;
}

/**
 * Get all step tasks for a task
 */
export const getStepTasksByTaskId = async (taskId: number): Promise<StepTaskResponse[]> => {
    const response = await apiClient.get<StepTaskResponse[]>(`/api/step-tasks/task/${taskId}`);
    return response.data;
};

/**
 * Get current step task for a task
 */
export const getCurrentStepTask = async (taskId: number): Promise<StepTaskResponse> => {
    const response = await apiClient.get<StepTaskResponse>(`/api/step-tasks/task/${taskId}/current`);
    return response.data;
};

/**
 * Check if current user is assignee of current step
 */
export const isUserAssignee = async (taskId: number): Promise<boolean> => {
    const response = await apiClient.get<boolean>(`/api/step-tasks/task/${taskId}/is-assignee`);
    return response.data;
};

/**
 * Get all actions for a task (activity log)
 */
export const getTaskActions = async (taskId: number): Promise<StepTaskActionResponse[]> => {
    const response = await apiClient.get<StepTaskActionResponse[]>(`/api/step-tasks/task/${taskId}/actions`);
    return response.data;
};

/**
 * Execute a workflow action (approve, reject, submit, etc.)
 */
export const executeAction = async (taskId: number, request: ExecuteActionRequest): Promise<TaskResponse> => {
    const response = await apiClient.post<TaskResponse>(`/api/step-tasks/task/${taskId}/execute-action`, request);
    return response.data;
};

/**
 * Get all StepTasks assigned to current user with IN_PROGRESS status.
 * Sorted by priority (desc) and beginDate (asc).
 */
export const getMyAssignedStepTasks = async (): Promise<StepTaskResponse[]> => {
    const response = await apiClient.get<StepTaskResponse[]>(`/api/step-tasks/my-assigned`);
    return response.data;
};

/**
 * Get StepTasks assigned to current user with IN_PROGRESS status for Workspace.
 * Sorted by priority (desc) only. Limited to 5 items.
 */
export const getMyAssignedStepTasksForWorkspace = async (): Promise<StepTaskResponse[]> => {
    const response = await apiClient.get<StepTaskResponse[]>(`/api/step-tasks/my-assigned-workspace`);
    return response.data;
};

/**
 * Get recent activity (StepTaskActions) for tasks where user is involved.
 * Returns last 7 events, ordered by createdAt DESC.
 */
export const getMyRecentActivity = async (): Promise<StepTaskActionResponse[]> => {
    const response = await apiClient.get<StepTaskActionResponse[]>(`/api/step-tasks/my-recent-activity`);
    return response.data;
};