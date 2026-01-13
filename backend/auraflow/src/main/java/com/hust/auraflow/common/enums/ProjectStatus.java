package com.hust.auraflow.common.enums;

/**
 * Enum representing the status of a Project.
 */
public enum ProjectStatus {
    /**
     * Project has no tasks yet
     */
    DRAFT,

    /**
     * Project has active tasks
     */
    ACTIVE,

    /**
     * Project has no more active tasks
     */
    CLOSED,

    /**
     * Project is paused by admin
     */
    ON_HOLD
}
