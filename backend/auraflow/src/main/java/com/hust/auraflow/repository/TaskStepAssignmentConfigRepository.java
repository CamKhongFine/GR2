package com.hust.auraflow.repository;

import com.hust.auraflow.entity.TaskStepAssignmentConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for TaskStepAssignmentConfig entity operations.
 */
@Repository
public interface TaskStepAssignmentConfigRepository extends JpaRepository<TaskStepAssignmentConfig, Long> {

    /**
     * Find all assignment configs for a given task.
     */
    List<TaskStepAssignmentConfig> findByTaskId(Long taskId);

    /**
     * Find assignment config for a specific task and workflow step.
     */
    Optional<TaskStepAssignmentConfig> findByTaskIdAndWorkflowStepId(Long taskId, Long workflowStepId);

    /**
     * Find all assignment configs for a specific workflow step in a task.
     * This supports future extension to multiple assignees per step.
     */
    @Query("SELECT c FROM TaskStepAssignmentConfig c WHERE c.task.id = :taskId AND c.workflowStep.id = :workflowStepId")
    List<TaskStepAssignmentConfig> findByTaskIdAndWorkflowStepIdList(@Param("taskId") Long taskId, @Param("workflowStepId") Long workflowStepId);

    /**
     * Delete all assignment configs for a given task.
     */
    @Modifying
    @Query("DELETE FROM TaskStepAssignmentConfig c WHERE c.task.id = :taskId")
    void deleteByTaskId(@Param("taskId") Long taskId);

    /**
     * Delete assignment configs for a specific workflow step in a task.
     * Called after snapshot to StepTask.
     */
    @Modifying
    @Query("DELETE FROM TaskStepAssignmentConfig c WHERE c.task.id = :taskId AND c.workflowStep.id = :workflowStepId")
    void deleteByTaskIdAndWorkflowStepId(@Param("taskId") Long taskId, @Param("workflowStepId") Long workflowStepId);
}
