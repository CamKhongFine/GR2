package com.hust.auraflow.repository;

import com.hust.auraflow.entity.WorkflowStepTransition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for WorkflowStepTransition entity operations.
 */
@Repository
public interface WorkflowStepTransitionRepository extends JpaRepository<WorkflowStepTransition, Long> {

    /**
     * Find all transitions by workflow ID (through fromStep relationship).
     */
    @Query("SELECT wst FROM WorkflowStepTransition wst WHERE wst.fromStep.workflow.id = :workflowId")
    List<WorkflowStepTransition> findByWorkflowId(@Param("workflowId") Long workflowId);

    /**
     * Delete all transitions by workflow ID (through fromStep relationship).
     */
    @Modifying
    @Query("DELETE FROM WorkflowStepTransition wst WHERE wst.fromStep.workflow.id = :workflowId")
    void deleteByWorkflowId(@Param("workflowId") Long workflowId);
}
