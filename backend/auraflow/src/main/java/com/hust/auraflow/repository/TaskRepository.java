package com.hust.auraflow.repository;

import com.hust.auraflow.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for Task entity operations.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Check if any task exists using the given workflow.
     * Used to prevent deletion/update of workflows that are in use.
     */
    boolean existsByWorkflowId(Long workflowId);
}
