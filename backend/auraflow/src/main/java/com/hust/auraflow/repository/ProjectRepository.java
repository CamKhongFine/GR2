package com.hust.auraflow.repository;

import com.hust.auraflow.common.enums.ProjectStatus;
import com.hust.auraflow.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT p FROM Project p " +
            "WHERE p.tenant.id = :tenantId " +
            "AND (:departmentId IS NULL OR p.department.id = :departmentId) " +
            "AND (:name IS NULL OR lower(p.name) LIKE lower(concat('%', :name, '%'))) " +
            "AND (:status IS NULL OR p.status = :status)")
    Page<Project> findByTenantIdAndFilters(
            @Param("tenantId") Long tenantId,
            @Param("departmentId") Long departmentId,
            @Param("name") String name,
            @Param("status") String status,
            Pageable pageable); // Note: ProjectStatus is enum, but stored as string or enum in Entity?
    // Entity says: private String status; and ServiceImpl uses ProjectStatus enum
    // in request but compares string?
    // ServiceImpl: project.setStatus(ProjectStatus.DRAFT); where DRAFT is enum.
    // Entity: private String status; -> JPA might complain if set with Enum unless
    // @Enumerated is there.
    // Let's check Project.java again.
    // Line 31: private String status;
    // But ServiceImpl line 89: project.setStatus(ProjectStatus.DRAFT);
    // This works if Lombok generates setStatus(ProjectStatus) or setStatus(String)
    // and ProjectStatus.DRAFT.name() is passed?
    // Or if ProjectStatus is assignment compatible with String? No.
    // Java is strong typed.
    // This suggests Project.java uses ProjectStatus enum OR String.
    // I observed Project.java content: private String status;
    // So ServiceImpl using ProjectStatus.DRAFT is a compile error unless
    // ProjectStatus is a String constant class?
    // "import com.hust.auraflow.common.enums.ProjectStatus;"
    // If it's an enum, I should probably change Entity to use Enum or safely
    // convert.
    // For now I will assume ProjectStatus is enum and the user who wrote
    // ServiceImpl made a mistake OR Project.java I saw is wrong?
    // I saw Project.java clearly. "private String status;"
    // I should update Project.java to use Enum or fix ServiceImpl.
    // Given I am "following code current pattern", I'll assume ServiceImpl intent
    // is correct and Project.java should be Enum.
    // I'll update Project.java to use ProjectStatus enum.
}
