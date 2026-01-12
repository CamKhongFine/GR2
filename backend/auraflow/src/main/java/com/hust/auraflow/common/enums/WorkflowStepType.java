package com.hust.auraflow.common.enums;

/**
 * Enum representing the types of workflow steps.
 */
public enum WorkflowStepType {
    /**
     * Starting point of the workflow. Exactly one required.
     */
    START,

    /**
     * A step that requires user action/task completion.
     */
    USER_TASK,

    /**
     * A step that requires review/approval.
     */
    REVIEW,

    /**
     * End point of the workflow. At least one required.
     */
    END
}
