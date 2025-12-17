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
    
    @Query(value = "SELECT * FROM users u WHERE " +
           "(:id IS NULL OR u.id = :id) AND " +
           "(:email IS NULL OR LOWER(u.email::text) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
           "(:status IS NULL OR u.status = CAST(:status AS VARCHAR)) AND " +
           "(:tenantId IS NULL OR u.tenant_id = :tenantId)",
           nativeQuery = true)
    Page<User> findByFilters(@Param("id") Long id,
                             @Param("email") String email,
                             @Param("status") String status,
                             @Param("tenantId") Long tenantId,
                             Pageable pageable);
    
    long countByStatus(UserStatus status);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") Long tenantId);
}
