package com.hust.auraflow.repository;

import com.hust.auraflow.entity.WorkflowStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for WorkflowStep entity operations.
 */
@Repository
public interface WorkflowStepRepository extends JpaRepository<WorkflowStep, Long> {

    /**
     * Find all steps by workflow ID.
     */
    List<WorkflowStep> findByWorkflowId(Long workflowId);

    /**
     * Find all steps by workflow ID ordered by step order.
     */
    @Query("SELECT ws FROM WorkflowStep ws WHERE ws.workflow.id = :workflowId ORDER BY ws.stepOrder ASC")
    List<WorkflowStep> findByWorkflowIdOrderByStepOrder(@Param("workflowId") Long workflowId);

    /**
     * Delete all steps by workflow ID.
     */
    @Modifying
    @Query("DELETE FROM WorkflowStep ws WHERE ws.workflow.id = :workflowId")
    void deleteByWorkflowId(@Param("workflowId") Long workflowId);
}
