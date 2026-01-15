package com.hust.auraflow.common.enums;

/**
 * Enum representing the status of a StepTask.
 * 
 * StepTask lifecycle:
 * - IN_PROGRESS: StepTask is created and currently being processed
 * - COMPLETED: StepTask has been successfully completed
 * - SKIPPED: StepTask was skipped (e.g., conditional flow)
 * - CANCELLED: StepTask was cancelled
 */
public enum StepTaskStatus {
    IN_PROGRESS,
    COMPLETED,
    SKIPPED,
    CANCELLED
}
