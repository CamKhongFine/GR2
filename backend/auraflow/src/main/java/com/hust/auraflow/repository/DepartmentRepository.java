package com.hust.auraflow.repository;

import com.hust.auraflow.entity.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByTenantId(Long tenantId);
    
    @Query(value = "SELECT * FROM departments d WHERE " +
           "d.tenant_id = :tenantId AND " +
           "(:name IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%', :name, '%')))",
           nativeQuery = true)
    Page<Department> findByTenantIdAndFilters(
            @Param("tenantId") Long tenantId,
            @Param("name") String name,
            Pageable pageable
    );
}
