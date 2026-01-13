package com.hust.auraflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Entity representing an immutable action history log for workflow step tasks.
 * 
 * This table records every action executed on a step task (approve, reject,
 * submit, etc.) for audit and timeline purposes. It is append-only and should
 * not be updated or deleted during normal operation.
 * 
 * IMPORTANT: actionName must match the 'action' column value in
 * WorkflowStepTransition to maintain consistency.
 */
@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "step_task_actions")
public class StepTaskAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    /**
     * Multi-tenant isolation
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    /**
     * Reference to the parent task (workflow instance)
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    /**
     * Reference to the specific step task this action was performed on
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "step_task_id", nullable = false)
    private StepTask stepTask;

    /**
     * The workflow step where the action originated
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "from_step_id", nullable = false)
    private WorkflowStep fromStep;

    /**
     * The workflow step that the action transitions to (nullable for terminal
     * actions)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_step_id")
    private WorkflowStep toStep;

    /**
     * The action performed (e.g., 'approve', 'reject', 'submit').
     * MUST match the 'action' value defined in WorkflowStepTransition.
     */
    @NotNull
    @Column(name = "action_name", nullable = false, length = 100)
    private String actionName;

    /**
     * The user who performed this action
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "actor_id", nullable = false)
    private User actor;

    /**
     * Optional comment or note provided by the actor
     */
    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    /**
     * Timestamp when the action was performed (immutable)
     */
    @NotNull
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
