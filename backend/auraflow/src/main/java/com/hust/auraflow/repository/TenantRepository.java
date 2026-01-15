package com.hust.auraflow.repository;

import com.hust.auraflow.common.enums.TenantStatus;
import com.hust.auraflow.entity.Tenant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    
    @Query(value = "SELECT * FROM tenants t WHERE " +
           "(:id IS NULL OR t.id = :id) AND " +
           "(:name IS NULL OR LOWER(t.name::text) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:status IS NULL OR t.status = CAST(:status AS VARCHAR))",
           nativeQuery = true)
    Page<Tenant> findByFilters(@Param("id") Long id,
                                @Param("name") String name,
                                @Param("status") String status, 
                                Pageable pageable);
}

