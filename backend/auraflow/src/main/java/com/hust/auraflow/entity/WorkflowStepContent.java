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
 * Entity representing content data for workflow step tasks.
 * 
 * This table stores business working data (documents, forms, notes, etc.)
 * submitted during workflow execution. It is NOT related to workflow actions
 * or transitions - those are logged in StepTaskAction.
 * 
 * Multiple records per step_task are allowed for versioned content tracking.
 */
@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "workflow_step_contents")
public class WorkflowStepContent {

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
     * Reference to the specific step task this content belongs to
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "step_task_id", nullable = false)
    private StepTask stepTask;

    /**
     * Reference to the workflow step template
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workflow_step_id", nullable = false)
    private WorkflowStep workflowStep;

    /**
     * Type of content stored (e.g., TEXT, MARKDOWN, JSON, HTML)
     */
    @NotNull
    @Column(name = "content_type", nullable = false, length = 50)
    private String contentType;

    /**
     * The actual content body (text, markdown, or JSON data)
     */
    @Column(name = "content_body", columnDefinition = "TEXT")
    private String contentBody;

    /**
     * User who created/submitted this content version
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @NotNull
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
