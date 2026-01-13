package com.hust.auraflow.common.enums;

import java.util.Arrays;

/**
 * Represents the overall lifecycle status of a workflow task (similar to Jira
 * issue status).
 * This status tracks the high-level state of the entire workflow instance,
 * not individual step executions.
 *
 * <p>
 * Lifecycle flow:
 * </p>
 * 
 * <pre>
 * PENDING → IN_PROGRESS → COMPLETED
 *                       ↘ CANCELLED
 * </pre>
 */
public enum TaskStatus {

    /**
     * Task has been created but the workflow has not started execution yet.
     * This is the initial state when a task is first created.
     */
    PENDING("PENDING", "Pending"),

    /**
     * Workflow is actively running with one or more step tasks in progress.
     * The workflow engine is processing steps and waiting for user actions.
     */
    IN_PROGRESS("IN_PROGRESS", "In Progress"),

    /**
     * Workflow has successfully reached an END step.
     * This is a terminal state - no further actions are possible.
     */
    COMPLETED("COMPLETED", "Completed"),

    /**
     * Task was manually cancelled before reaching completion.
     * This is a terminal state triggered by user action, not by business rules like
     * rejection.
     * Cancellation invalidates all pending step tasks.
     */
    CANCELLED("CANCELLED", "Cancelled");

    private final String code;
    private final String displayName;

    TaskStatus(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Finds a TaskStatus by its code.
     *
     * @param code the status code to search for
     * @return the matching TaskStatus
     * @throws IllegalArgumentException if no matching status is found
     */
    public static TaskStatus fromCode(String code) {
        return Arrays.stream(values())
                .filter(status -> status.code.equals(code))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown TaskStatus code: " + code));
    }
}
