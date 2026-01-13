package com.hust.auraflow.entity;

import com.hust.auraflow.common.enums.AssigneeType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "workflow_steps")
public class WorkflowStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workflow_id", nullable = false)
    private Workflow workflow;

    @Column(name = "step_order")
    private Integer stepOrder;

    @Column(name = "name", length = Integer.MAX_VALUE)
    private String name;

    @Column(name = "description", length = Integer.MAX_VALUE)
    private String description;

    @Column(name = "step_type", length = Integer.MAX_VALUE)
    private String stepType;

    /**
     * Defines how the assignee is determined for this step.
     * 
     * <ul>
     * <li>{@code FIXED} - Assignee is predefined in the template (see
     * {@link #assigneeValue})</li>
     * <li>{@code DYNAMIC} - Assignee is selected at runtime by the user</li>
     * </ul>
     * 
     * <p>
     * Default is {@code DYNAMIC} if not specified.
     * </p>
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "assignee_type", length = 20)
    private AssigneeType assigneeType;

    /**
     * The predefined assignee value when {@link #assigneeType} is {@code FIXED}.
     * 
     * <p>
     * This value is interpreted at runtime and can be:
     * </p>
     * <ul>
     * <li>A specific user ID (e.g., "123")</li>
     * <li>A role code (e.g., "DEPARTMENT_LEADER", "DIVISION_LEADER")</li>
     * <li>A system keyword (e.g., "TASK_CREATOR", "PREVIOUS_ACTOR")</li>
     * </ul>
     * 
     * <p>
     * Should be null when {@link #assigneeType} is {@code DYNAMIC}.
     * </p>
     */
    @Column(name = "assignee_value", length = 255)
    private String assigneeValue;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

}
