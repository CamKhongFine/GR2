package com.hust.auraflow.repository;

import com.hust.auraflow.entity.Division;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DivisionRepository extends JpaRepository<Division, Long> {
    
    @Query(value = "SELECT * FROM divisions d WHERE " +
           "d.tenant_id = :tenantId AND " +
           "(:name IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%', :name, '%')))",
           nativeQuery = true)
    Page<Division> findByTenantIdAndFilters(
            @Param("tenantId") Long tenantId,
            @Param("name") String name,
            Pageable pageable
    );
}

