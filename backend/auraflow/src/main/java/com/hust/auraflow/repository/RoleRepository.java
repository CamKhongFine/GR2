package com.hust.auraflow.repository;

import com.hust.auraflow.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    @Query(value = "SELECT * FROM roles r WHERE " +
           "(:id IS NULL OR r.id = :id) AND " +
           "(:name IS NULL OR LOWER(r.name::text) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:level IS NULL OR r.level = :level)",
           nativeQuery = true)
    Page<Role> findByFilters(@Param("id") Long id,
                             @Param("name") String name,
                             @Param("level") Integer level,
                             Pageable pageable);
}
