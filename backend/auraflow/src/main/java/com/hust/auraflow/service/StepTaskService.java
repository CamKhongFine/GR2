package com.hust.auraflow.service;

import com.hust.auraflow.dto.request.ExecuteActionRequest;
import com.hust.auraflow.dto.response.StepTaskActionResponse;
import com.hust.auraflow.dto.response.StepTaskResponse;
import com.hust.auraflow.dto.response.TaskResponse;
import com.hust.auraflow.security.UserPrincipal;

import java.util.List;

public interface StepTaskService {
    /**
     * Get all step tasks for a given task
     */
    List<StepTaskResponse> getStepTasksByTaskId(UserPrincipal principal, Long taskId);

    /**
     * Get current step task for a given task
     */
    StepTaskResponse getCurrentStepTask(UserPrincipal principal, Long taskId);

    /**
     * Check if current user is assignee of current step
     */
    boolean isUserAssigneeOfCurrentStep(UserPrincipal principal, Long taskId);

    /**
     * Get all actions (activity log) for a given task
     */
    List<StepTaskActionResponse> getTaskActions(UserPrincipal principal, Long taskId);

    /**
     * Execute a workflow action (approve, reject, submit, etc.)
     */
    TaskResponse executeAction(UserPrincipal principal, Long taskId, ExecuteActionRequest request);
}
