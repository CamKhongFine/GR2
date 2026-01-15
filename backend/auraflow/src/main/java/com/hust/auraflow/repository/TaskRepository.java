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

        @Query(value = "SELECT * FROM tasks t WHERE " +
                        "t.tenant_id = :tenantId AND " +
                        "(:projectId IS NULL OR t.project_id = :projectId) AND " +
                        "(:title IS NULL OR LOWER(CAST(t.title AS TEXT)) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
                        "(:status IS NULL OR t.status = :status) AND " +
                        "(:priority IS NULL OR t.priority = :priority) AND " +
                        "(:creatorId IS NULL OR t.creator_id = :creatorId)", nativeQuery = true)
        Page<Task> findByTenantIdAndFilters(
                        @Param("tenantId") Long tenantId,
                        @Param("projectId") Long projectId,
                        @Param("title") String title,
                        @Param("status") String status,
                        @Param("priority") String priority,
                        @Param("creatorId") Long creatorId,
                        Pageable pageable);
}
