package com.hust.auraflow.repository;

import com.hust.auraflow.entity.Workflow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Workflow entity operations.
 */
@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, Long> {

    /**
     * Find all workflows by tenant ID with pagination.
     */
    @Query("SELECT w FROM Workflow w WHERE w.tenant.id = :tenantId")
    Page<Workflow> findByTenantId(@Param("tenantId") Long tenantId, Pageable pageable);

    /**
     * Find active workflows by tenant ID with pagination.
     */
    @Query("SELECT w FROM Workflow w WHERE w.tenant.id = :tenantId AND w.isActive = :isActive")
    Page<Workflow> findByTenantIdAndIsActive(
            @Param("tenantId") Long tenantId,
            @Param("isActive") Boolean isActive,
            Pageable pageable);

    /**
     * Find workflow by ID and tenant ID (for tenant isolation).
     */
    @Query("SELECT w FROM Workflow w WHERE w.id = :id AND w.tenant.id = :tenantId")
    Optional<Workflow> findByIdAndTenantId(@Param("id") Long id, @Param("tenantId") Long tenantId);
}
