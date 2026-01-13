package com.hust.auraflow.common.enums;

import java.util.Arrays;

/**
 * Represents the execution status of a single workflow step task.
 * This status tracks individual step instances within a workflow,
 * independent of business decisions (approve/reject are actions, not statuses).
 *
 * <p>
 * Lifecycle flow:
 * </p>
 * 
 * <pre>
 * PENDING → IN_PROGRESS → COMPLETED
 *         ↘ SKIPPED
 *         ↘ CANCELLED
 * </pre>
 */
public enum StepTaskStatus {

    /**
     * Step task has been created but work has not started yet.
     * The step is waiting to be picked up by the assignee.
     */
    PENDING("PENDING", "Pending"),

    /**
     * Assignee is actively working on this step.
     * The step is awaiting an action (submit, approve, reject, etc.).
     */
    IN_PROGRESS("IN_PROGRESS", "In Progress"),

    /**
     * Step has been completed via a valid workflow action.
     * The action taken (approve, reject, submit, etc.) is recorded separately.
     * This is a terminal state for the step.
     */
    COMPLETED("COMPLETED", "Completed"),

    /**
     * Step was automatically skipped by the workflow engine.
     * Used for audit purposes when conditions cause a step to be bypassed.
     * This is a terminal state.
     */
    SKIPPED("SKIPPED", "Skipped"),

    /**
     * Step was invalidated due to task cancellation or workflow reset.
     * This is a terminal state triggered by parent task cancellation
     * or workflow navigation (e.g., reject going back to previous step).
     */
    CANCELLED("CANCELLED", "Cancelled");

    private final String code;
    private final String displayName;

    StepTaskStatus(String code, String displayName) {
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
     * Finds a StepTaskStatus by its code.
     *
     * @param code the status code to search for
     * @return the matching StepTaskStatus
     * @throws IllegalArgumentException if no matching status is found
     */
    public static StepTaskStatus fromCode(String code) {
        return Arrays.stream(values())
                .filter(status -> status.code.equals(code))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown StepTaskStatus code: " + code));
    }
}
