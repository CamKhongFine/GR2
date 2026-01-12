package com.hust.auraflow.service;

import com.hust.auraflow.dto.*;
import com.hust.auraflow.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for Workflow CRUD operations.
 * All operations are tenant-scoped.
 */
public interface WorkflowService {

    /**
     * Create a new workflow with its steps and transitions atomically.
     * 
     * @param principal Current user's principal
     * @param request   Create request with steps and transitions
     * @return Created workflow detail response
     */
    WorkflowDetailResponse createWorkflow(UserPrincipal principal, CreateWorkflowRequest request);

    /**
     * Get workflow by ID with all steps and transitions.
     * 
     * @param principal  Current user's principal
     * @param workflowId Workflow ID
     * @return Workflow detail response
     * @throws IllegalArgumentException if workflow not found or not in user's
     *                                  tenant
     */
    WorkflowDetailResponse getWorkflowById(UserPrincipal principal, Long workflowId);

    /**
     * List all workflows in the current user's tenant with pagination.
     * 
     * @param principal Current user's principal
     * @param pageable  Pagination parameters
     * @return Paginated list of workflows (minimal info)
     */
    Page<WorkflowResponse> listWorkflows(UserPrincipal principal, Pageable pageable);

    /**
     * Update a workflow with its steps and transitions atomically.
     * Workflow can only be updated if no Task exists using it.
     * 
     * @param principal  Current user's principal
     * @param workflowId Workflow ID to update
     * @param request    Update request with steps and transitions
     * @return Updated workflow detail response
     * @throws IllegalArgumentException if workflow not found or not in user's
     *                                  tenant
     * @throws IllegalStateException    if workflow is in use by any Task
     */
    WorkflowDetailResponse updateWorkflow(UserPrincipal principal, Long workflowId, UpdateWorkflowRequest request);

    /**
     * Delete a workflow and all its steps and transitions.
     * Workflow can only be deleted if no Task exists using it.
     * 
     * @param principal  Current user's principal
     * @param workflowId Workflow ID to delete
     * @throws IllegalArgumentException if workflow not found or not in user's
     *                                  tenant
     * @throws IllegalStateException    if workflow is in use by any Task
     */
    void deleteWorkflow(UserPrincipal principal, Long workflowId);
}
