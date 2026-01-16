package com.hust.auraflow.repository;

import com.hust.auraflow.common.enums.StepTaskStatus;
import com.hust.auraflow.entity.StepTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for StepTask entity operations.
 */
@Repository
public interface StepTaskRepository extends JpaRepository<StepTask, Long> {

    /**
     * Find all step tasks for a given task.
     */
    List<StepTask> findByTaskId(Long taskId);

    /**
     * Find all step tasks for a given task ordered by step sequence.
     */
    @Query("SELECT st FROM StepTask st WHERE st.task.id = :taskId ORDER BY st.stepSequence ASC")
    List<StepTask> findByTaskIdOrderByStepSequence(@Param("taskId") Long taskId);

    /**
     * Find a step task by task ID and workflow step ID with IN_PROGRESS status.
     * This ensures we get the active step task when there might be completed ones
     * from previous iterations.
     */
    @Query("SELECT st FROM StepTask st WHERE st.task.id = :taskId AND st.workflowStep.id = :workflowStepId AND st.status = 'IN_PROGRESS'")
    Optional<StepTask> findActiveByTaskIdAndWorkflowStepId(@Param("taskId") Long taskId,
            @Param("workflowStepId") Long workflowStepId);

    /**
     * Find latest step task by task ID and workflow step ID (highest iteration).
     */
    @Query("SELECT st FROM StepTask st WHERE st.task.id = :taskId AND st.workflowStep.id = :workflowStepId ORDER BY st.iteration DESC")
    List<StepTask> findByTaskIdAndWorkflowStepIdOrderByIterationDesc(@Param("taskId") Long taskId,
            @Param("workflowStepId") Long workflowStepId);

    /**
     * Find a step task by task ID and workflow step ID.
     * 
     * @deprecated Use findActiveByTaskIdAndWorkflowStepId or
     *             findByTaskIdAndWorkflowStepIdOrderByIterationDesc instead
     */
    @Deprecated
    Optional<StepTask> findByTaskIdAndWorkflowStepId(Long taskId, Long workflowStepId);

    /**
     * Get max iteration for a workflow step in a task.
     */
    @Query("SELECT COALESCE(MAX(st.iteration), 0) FROM StepTask st WHERE st.task.id = :taskId AND st.workflowStep.id = :workflowStepId")
    Integer getMaxIterationByTaskIdAndWorkflowStepId(@Param("taskId") Long taskId,
            @Param("workflowStepId") Long workflowStepId);

    /**
     * Find all step tasks for a given task with specific status.
     */
    @Query("SELECT st FROM StepTask st WHERE st.task.id = :taskId AND st.status = :status")
    List<StepTask> findByTaskIdAndStatus(@Param("taskId") Long taskId, @Param("status") StepTaskStatus status);

    /**
     * Find the current active step task for a given task (IN_PROGRESS status).
     */
    @Query("SELECT st FROM StepTask st WHERE st.task.id = :taskId AND st.status = :status ORDER BY st.stepSequence DESC")
    Optional<StepTask> findCurrentActiveByTaskId(@Param("taskId") Long taskId, @Param("status") StepTaskStatus status);

    /**
     * Find all step tasks assigned to a user with IN_PROGRESS status.
     * Sorted by priority (desc) and beginDate (asc).
     */
    @Query("SELECT st FROM StepTask st WHERE st.assignedUser.id = :userId AND st.status = :status ORDER BY st.priority DESC, st.beginDate ASC")
    List<StepTask> findByAssignedUserIdAndStatus(@Param("userId") Long userId, @Param("status") StepTaskStatus status);

    /**
     * Find all step tasks assigned to a user with IN_PROGRESS status.
     * Sorted by priority (desc) only. For Workspace use (limit 5).
     */
    @Query("SELECT st FROM StepTask st WHERE st.assignedUser.id = :userId AND st.status = :status ORDER BY st.priority DESC")
    List<StepTask> findByAssignedUserIdAndStatusOrderByPriorityDesc(@Param("userId") Long userId,
            @Param("status") StepTaskStatus status);

    /**
     * Delete all step tasks for a given task.
     */
    @Modifying
    @Query("DELETE FROM StepTask st WHERE st.task.id = :taskId")
    void deleteByTaskId(@Param("taskId") Long taskId);
}
