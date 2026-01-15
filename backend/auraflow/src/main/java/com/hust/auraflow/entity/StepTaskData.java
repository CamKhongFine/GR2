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
@Table(name = "step_task_data")
public class StepTaskData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "step_task_id", nullable = false)
    private StepTask stepTask;

    /**
     * Business data payload (form values, structured data, etc.)
     */
    @Column(name = "data_body", columnDefinition = "TEXT")
    private String dataBody;

    /**
     * Optional content type (JSON, MARKDOWN, TEXT)
     */
    @Column(name = "data_type", length = 50)
    private String dataType;

    /**
     * Content type (required field in database)
     */
    @NotNull
    @Column(name = "content_type", length = 50, nullable = false)
    private String contentType;

    /**
     * Who submitted this data
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @NotNull
    @Column(updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}