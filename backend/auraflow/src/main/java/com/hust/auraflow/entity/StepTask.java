package com.hust.auraflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import com.hust.auraflow.common.enums.StepTaskStatus;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "step_tasks")
public class StepTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_step_id")
    private WorkflowStep workflowStep;

    @Column(name = "step_sequence")
    private Integer stepSequence;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private StepTaskStatus status;

    @Column(name = "work_progress", length = Integer.MAX_VALUE)
    private String workProgress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_user")
    private User assignedUser;

    @Column(name = "begin_date")
    private Instant beginDate;

    @Column(name = "end_date")
    private Instant endDate;

    @Column(name = "note", length = Integer.MAX_VALUE)
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private com.hust.auraflow.common.enums.Priority priority;

}