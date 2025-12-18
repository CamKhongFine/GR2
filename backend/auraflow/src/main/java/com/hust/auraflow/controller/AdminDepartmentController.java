package com.hust.auraflow.controller;

import com.hust.auraflow.dto.*;
import com.hust.auraflow.security.UserPrincipal;
import com.hust.auraflow.service.AdminDepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for Admin-scoped department management.
 * All endpoints require ADMIN role and enforce tenant isolation.
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/departments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDepartmentController {

    private final AdminDepartmentService adminDepartmentService;

    /**
     * Get all departments in the current admin's tenant.
     */
    @GetMapping
    public ResponseEntity<Page<DepartmentResponse>> getTenantDepartments(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long divisionId,
            @RequestParam(required = false) String name,
            Pageable pageable) {
        try {
            Page<DepartmentResponse> departments = adminDepartmentService.getTenantDepartments(
                    principal, divisionId, name, pageable);
            return ResponseEntity.ok(departments);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Error getting tenant departments", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Create a new department in the current admin's tenant.
     */
    @PostMapping
    public ResponseEntity<DepartmentResponse> createDepartment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateDepartmentRequest request) {
        try {
            DepartmentResponse response = adminDepartmentService.createDepartment(principal, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Error creating department", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Update a department in the current admin's tenant.
     */
    @PutMapping("/{id}")
    public ResponseEntity<DepartmentResponse> updateDepartment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateDepartmentRequest request) {
        try {
            DepartmentResponse response = adminDepartmentService.updateDepartment(principal, id, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error updating department", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Delete a department in the current admin's tenant.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        try {
            adminDepartmentService.deleteDepartment(principal, id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Error deleting department", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Get a department by ID in the current admin's tenant.
     */
    @GetMapping("/{id}")
    public ResponseEntity<DepartmentResponse> getDepartmentById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        try {
            DepartmentResponse response = adminDepartmentService.getDepartmentById(principal, id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error getting department", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Get paginated members of a department.
     */
    @GetMapping("/{departmentId}/members")
    public ResponseEntity<Page<UserResponse>> getDepartmentMembers(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long departmentId,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        try {
            Page<UserResponse> members = 
                    adminDepartmentService.getDepartmentMembers(principal, departmentId, search, pageable);
            return ResponseEntity.ok(members);
        } catch (IllegalArgumentException e) {
            log.error("Error getting department members", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Assign a user to a department.
     */
    @PutMapping("/{departmentId}/members/{userId}")
    public ResponseEntity<Void> assignMemberToDepartment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long departmentId,
            @PathVariable Long userId) {
        try {
            adminDepartmentService.assignMemberToDepartment(principal, departmentId, userId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.error("Error assigning member to department", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Remove a user from a department.
     */
    @DeleteMapping("/{departmentId}/members/{userId}")
    public ResponseEntity<Void> removeMemberFromDepartment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long departmentId,
            @PathVariable Long userId) {
        try {
            adminDepartmentService.removeMemberFromDepartment(principal, departmentId, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Error removing member from department", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Get available users for department assignment.
     * Returns users in the same division but not assigned to any department.
     */
    @GetMapping("/{departmentId}/available-users")
    public ResponseEntity<Page<UserResponse>> getAvailableUsersForDepartment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long departmentId,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        try {
            Page<UserResponse> users = 
                    adminDepartmentService.getAvailableUsersForDepartment(principal, departmentId, search, pageable);
            return ResponseEntity.ok(users);
        } catch (IllegalArgumentException e) {
            log.error("Error getting available users for department", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
