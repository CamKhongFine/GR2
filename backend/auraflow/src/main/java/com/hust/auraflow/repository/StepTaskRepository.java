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
     * Find a step task by task ID and workflow step ID.
     */
    Optional<StepTask> findByTaskIdAndWorkflowStepId(Long taskId, Long workflowStepId);

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
     * Delete all step tasks for a given task.
     */
    @Modifying
    @Query("DELETE FROM StepTask st WHERE st.task.id = :taskId")
    void deleteByTaskId(@Param("taskId") Long taskId);
}
