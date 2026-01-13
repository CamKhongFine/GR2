package com.hust.auraflow.controller;

import com.hust.auraflow.dto.request.CreateWorkflowRequest;
import com.hust.auraflow.dto.request.UpdateWorkflowRequest;
import com.hust.auraflow.dto.response.WorkflowDetailResponse;
import com.hust.auraflow.dto.response.WorkflowResponse;
import com.hust.auraflow.security.UserPrincipal;
import com.hust.auraflow.service.WorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for Workflow CRUD operations.
 * Requires ADMIN role and enforces tenant isolation.
 */
@Slf4j
@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class WorkflowController {

    private final WorkflowService workflowService;

    /**
     * Create a new workflow with steps and transitions atomically.
     * <p>
     * POST /api/workflows
     */
    @PostMapping
    public ResponseEntity<?> createWorkflow(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateWorkflowRequest request) {
        try {
            WorkflowDetailResponse response = workflowService.createWorkflow(principal, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.error("Error creating workflow: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (IllegalStateException e) {
            log.error("Error creating workflow: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get workflow detail by ID including all steps and transitions.
     * <p>
     * GET /api/workflows/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getWorkflowById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        try {
            WorkflowDetailResponse response = workflowService.getWorkflowById(principal, id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error getting workflow: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (IllegalStateException e) {
            log.error("Error getting workflow: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * List all workflows in the current tenant with pagination.
     * <p>
     * GET /api/workflows
     */
    @GetMapping
    public ResponseEntity<?> listWorkflows(
            @AuthenticationPrincipal UserPrincipal principal,
            Pageable pageable) {
        try {
            Page<WorkflowResponse> response = workflowService.listWorkflows(principal, pageable);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Error listing workflows: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Update a workflow with new steps and transitions atomically.
     * Fails if workflow is in use by any Task.
     * <p>
     * PUT /api/workflows/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateWorkflow(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateWorkflowRequest request) {
        try {
            WorkflowDetailResponse response = workflowService.updateWorkflow(principal, id, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error updating workflow: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (IllegalStateException e) {
            log.error("Error updating workflow: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Delete a workflow and all its steps and transitions.
     * Fails if workflow is in use by any Task.
     * <p>
     * DELETE /api/workflows/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWorkflow(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        try {
            workflowService.deleteWorkflow(principal, id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Error deleting workflow: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (IllegalStateException e) {
            log.error("Error deleting workflow: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Simple error response wrapper for API errors.
     */
    private record ErrorResponse(String message) {
    }
}
