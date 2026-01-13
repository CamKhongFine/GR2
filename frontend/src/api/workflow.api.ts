import apiClient from '../lib/apiClient';

// ============ Type Definitions ============

export type WorkflowStepType = 'START' | 'USER_TASK' | 'REVIEW' | 'END';

export interface WorkflowStepRequest {
    clientId: string;
    name: string;
    description?: string;
    type: WorkflowStepType;
    stepOrder?: number;
}

export interface WorkflowTransitionRequest {
    from: string;
    to: string;
    action: string;
}

export interface CreateWorkflowRequest {
    name: string;
    description?: string;
    steps: WorkflowStepRequest[];
    transitions?: WorkflowTransitionRequest[];
}

export interface UpdateWorkflowRequest {
    name: string;
    description?: string;
    isActive?: boolean;
    steps: WorkflowStepRequest[];
    transitions?: WorkflowTransitionRequest[];
}

export interface WorkflowStepResponse {
    id: number;
    name: string;
    description?: string;
    type: WorkflowStepType;
    stepOrder?: number;
}

export interface WorkflowTransitionResponse {
    id: number;
    fromStepId: number;
    toStepId: number;
    action: string;
}

export interface WorkflowResponse {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
}

export interface WorkflowDetailResponse {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    steps: WorkflowStepResponse[];
    transitions: WorkflowTransitionResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

// ============ API Functions ============

export const fetchWorkflows = async (
    page: number = 0,
    size: number = 10
): Promise<PagedResponse<WorkflowResponse>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    const response = await apiClient.get<PagedResponse<WorkflowResponse>>(
        `/api/workflows?${params.toString()}`
    );
    return response.data;
};

export const getWorkflowById = async (id: number): Promise<WorkflowDetailResponse> => {
    const response = await apiClient.get<WorkflowDetailResponse>(`/api/workflows/${id}`);
    return response.data;
};

export const createWorkflow = async (data: CreateWorkflowRequest): Promise<WorkflowDetailResponse> => {
    const response = await apiClient.post<WorkflowDetailResponse>('/api/workflows', data);
    return response.data;
};

export const updateWorkflow = async (
    id: number,
    data: UpdateWorkflowRequest
): Promise<WorkflowDetailResponse> => {
    const response = await apiClient.put<WorkflowDetailResponse>(`/api/workflows/${id}`, data);
    return response.data;
};

export const deleteWorkflow = async (id: number): Promise<void> => {
    await apiClient.delete(`/api/workflows/${id}`);
};
