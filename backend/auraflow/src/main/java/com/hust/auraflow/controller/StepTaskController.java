package com.hust.auraflow.controller;

import com.hust.auraflow.dto.request.ExecuteActionRequest;
import com.hust.auraflow.dto.response.StepTaskActionResponse;
import com.hust.auraflow.dto.response.StepTaskDetailResponse;
import com.hust.auraflow.dto.response.StepTaskResponse;
import com.hust.auraflow.dto.response.TaskResponse;
import com.hust.auraflow.security.UserPrincipal;
import com.hust.auraflow.service.StepTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/step-tasks")
@RequiredArgsConstructor
public class StepTaskController {

    private final StepTaskService stepTaskService;

    /**
     * Get all step tasks for a given task
     */
    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<StepTaskResponse>> getStepTasksByTaskId(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long taskId) {
        return ResponseEntity.ok(stepTaskService.getStepTasksByTaskId(principal, taskId));
    }

    /**
     * Get current step task for a given task
     */
    @GetMapping("/task/{taskId}/current")
    public ResponseEntity<StepTaskResponse> getCurrentStepTask(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long taskId) {
        return ResponseEntity.ok(stepTaskService.getCurrentStepTask(principal, taskId));
    }

    /**
     * Check if current user is assignee of current step
     */
    @GetMapping("/task/{taskId}/is-assignee")
    public ResponseEntity<Boolean> isUserAssignee(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long taskId) {
        return ResponseEntity.ok(stepTaskService.isUserAssigneeOfCurrentStep(principal, taskId));
    }

    /**
     * Get all actions (activity log) for a given task
     */
    @GetMapping("/task/{taskId}/actions")
    public ResponseEntity<List<StepTaskActionResponse>> getTaskActions(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long taskId) {
        return ResponseEntity.ok(stepTaskService.getTaskActions(principal, taskId));
    }

    /**
     * Execute a workflow action (approve, reject, submit, etc.)
     */
    @PostMapping("/task/{taskId}/execute-action")
    public ResponseEntity<TaskResponse> executeAction(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long taskId,
            @Valid @RequestBody ExecuteActionRequest request) {
        return ResponseEntity.ok(stepTaskService.executeAction(principal, taskId, request));
    }

    /**
     * Get all StepTasks assigned to current user with IN_PROGRESS status.
     * Sorted by priority (desc) and beginDate (asc).
     */
    @GetMapping("/my-assigned")
    public ResponseEntity<List<StepTaskResponse>> getMyAssignedStepTasks(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(stepTaskService.getMyAssignedStepTasks(principal));
    }

    /**
     * Get StepTasks assigned to current user with IN_PROGRESS status for Workspace.
     * Sorted by priority (desc) only. Limited to 5 items.
     */
    @GetMapping("/my-assigned-workspace")
    public ResponseEntity<List<StepTaskResponse>> getMyAssignedStepTasksForWorkspace(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(stepTaskService.getMyAssignedStepTasksForWorkspace(principal));
    }

    /**
     * Get recent activity (StepTaskActions) for tasks where user is involved.
     * Returns last 7 events, ordered by createdAt DESC.
     */
    @GetMapping("/my-recent-activity")
    public ResponseEntity<List<StepTaskActionResponse>> getMyRecentActivity(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(stepTaskService.getMyRecentActivity(principal));
    }

    /**
     * Get detailed information for a step task including data, files, and comment.
     */
    @GetMapping("/{stepTaskId}/detail")
    public ResponseEntity<StepTaskDetailResponse> getStepTaskDetail(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long stepTaskId) {
        return ResponseEntity.ok(stepTaskService.getStepTaskDetail(principal, stepTaskId));
    }
}
