package com.hust.auraflow.repository;

import com.hust.auraflow.common.enums.UserStatus;
import com.hust.auraflow.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByKeycloakSub(String keycloakSub);
    
    @Query(value = "SELECT DISTINCT u.* FROM users u " +
           "LEFT JOIN user_roles ur ON u.id = ur.user_id " +
           "LEFT JOIN roles r ON ur.role_id = r.id " +
           "WHERE " +
           "(:id IS NULL OR u.id = :id) AND " +
           "(:email IS NULL OR LOWER(u.email::text) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
           "(:status IS NULL OR u.status = CAST(:status AS VARCHAR)) AND " +
           "(:tenantId IS NULL OR u.tenant_id = :tenantId) AND " +
           "(:roleLevel IS NULL OR (r.level IS NOT NULL AND r.level = :roleLevel))",
           nativeQuery = true)
    Page<User> findByFilters(@Param("id") Long id,
                             @Param("email") String email,
                             @Param("status") String status,
                             @Param("tenantId") Long tenantId,
                             @Param("roleLevel") Integer roleLevel,
                             Pageable pageable);
    
    long countByStatus(UserStatus status);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") Long tenantId);
    
    @Query(value = "SELECT DISTINCT u.* FROM users u " +
           "WHERE " +
           "u.tenant_id = :tenantId AND " +
           "u.division_id = :divisionId AND " +
           "(:departmentId IS NULL OR u.department_id = :departmentId) AND " +
           "(:search IS NULL OR " +
           "LOWER(u.email::text) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.first_name::text) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.last_name::text) LIKE LOWER(CONCAT('%', :search, '%')))",
           nativeQuery = true)
    Page<User> findByDivisionIdAndFilters(@Param("tenantId") Long tenantId,
                                           @Param("divisionId") Long divisionId,
                                           @Param("departmentId") Long departmentId,
                                           @Param("search") String search,
                                           Pageable pageable);
    
    @Query(value = "SELECT DISTINCT u.* FROM users u " +
           "WHERE " +
           "u.tenant_id = :tenantId AND " +
           "u.department_id = :departmentId AND " +
           "(:search IS NULL OR " +
           "LOWER(u.email::text) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.first_name::text) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.last_name::text) LIKE LOWER(CONCAT('%', :search, '%')))",
           nativeQuery = true)
    Page<User> findByDepartmentIdAndFilters(@Param("tenantId") Long tenantId,
                                             @Param("departmentId") Long departmentId,
                                             @Param("search") String search,
                                             Pageable pageable);
    
    @Query(value = "SELECT DISTINCT u.* FROM users u " +
           "WHERE " +
           "u.tenant_id = :tenantId AND " +
           "u.division_id = :divisionId AND " +
           "u.department_id IS NULL AND " +
           "(:search IS NULL OR " +
           "LOWER(u.email::text) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.first_name::text) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.last_name::text) LIKE LOWER(CONCAT('%', :search, '%')))",
           nativeQuery = true)
    Page<User> findAvailableUsersForDepartment(@Param("tenantId") Long tenantId,
                                                 @Param("divisionId") Long divisionId,
                                                 @Param("search") String search,
                                                 Pageable pageable);
}
