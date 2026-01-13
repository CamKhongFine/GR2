package com.hust.auraflow.repository;

import com.hust.auraflow.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT t FROM Task t " +
            "WHERE t.tenant.id = :tenantId " +
            "AND (:projectId IS NULL OR t.project.id = :projectId) " +
            "AND (:title IS NULL OR lower(t.title) LIKE lower(concat('%', :title, '%'))) " +
            "AND (:status IS NULL OR t.status = :status) " +
            "AND (:priority IS NULL OR t.priority = :priority)")
    Page<Task> findByTenantIdAndFilters(
            @Param("tenantId") Long tenantId,
            @Param("projectId") Long projectId,
            @Param("title") String title,
            @Param("status") String status,
            @Param("priority") String priority,
            Pageable pageable);
}
