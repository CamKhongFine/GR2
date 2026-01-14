package com.hust.auraflow.repository;

import com.hust.auraflow.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query(value = "SELECT * FROM projects p WHERE " +
            "p.tenant_id = :tenantId AND " +
            "(:departmentId IS NULL OR p.department_id = :departmentId) AND " +
            "(:name IS NULL OR LOWER(CAST(p.name AS TEXT)) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:status IS NULL OR p.status = :status)",
            nativeQuery = true)
    Page<Project> findByTenantIdAndFilters(
            @Param("tenantId") Long tenantId,
            @Param("departmentId") Long departmentId,
            @Param("name") String name,
            @Param("status") String status,
            Pageable pageable);
}
