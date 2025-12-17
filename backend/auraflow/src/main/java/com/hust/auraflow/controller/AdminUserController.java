package com.hust.auraflow.controller;

import com.hust.auraflow.dto.InviteResponse;
import com.hust.auraflow.dto.UpdateUserRequest;
import com.hust.auraflow.dto.UserResponse;
import com.hust.auraflow.entity.Role;
import com.hust.auraflow.security.UserPrincipal;
import com.hust.auraflow.service.AdminUserService;
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

import java.util.List;
import java.util.Map;

/**
 * REST controller for Admin-scoped user management.
 * All endpoints require ADMIN role and enforce tenant isolation.
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    /**
     * Get all users in the current admin's tenant.
     */
    @GetMapping
    public ResponseEntity<Page<UserResponse>> getTenantUsers(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer roleLevel,
            Pageable pageable) {
        try {
            Page<UserResponse> users = adminUserService.getTenantUsers(
                    principal, email, status, roleLevel, pageable);
            return ResponseEntity.ok(users);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Error getting tenant users", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Invite a user to the current admin's tenant.
     */
    @PostMapping("/invite")
    public ResponseEntity<InviteResponse> inviteTenantUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new InviteResponse("Email is required"));
            }
            
            InviteResponse response = adminUserService.inviteTenantUser(principal, email);
            return ResponseEntity.accepted().body(response);
        } catch (IllegalArgumentException e) {
            log.error("Error inviting user", e);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new InviteResponse(e.getMessage()));
        } catch (IllegalStateException e) {
            log.error("Error inviting user - invalid state", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new InviteResponse(e.getMessage()));
        }
    }

    /**
     * Get roles that the current admin can assign.
     * Returns only roles with level > admin's role level.
     */
    @GetMapping("/roles/available")
    public ResponseEntity<List<Role>> getAvailableRoles(
            @AuthenticationPrincipal UserPrincipal principal) {
        try {
            List<Role> roles = adminUserService.getAvailableRoles(principal);
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            log.error("Error getting available roles", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update a user in the current admin's tenant.
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateTenantUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        try {
            UserResponse response = adminUserService.updateTenantUser(principal, id, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error updating user", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Assign roles to a user in the current admin's tenant.
     */
    @PutMapping("/{id}/roles")
    public ResponseEntity<UserResponse> assignRolesToTenantUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody Map<String, List<Long>> request) {
        try {
            List<Long> roleIds = request.get("roleIds");
            if (roleIds == null || roleIds.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            
            UserResponse response = adminUserService.assignRolesToTenantUser(principal, id, roleIds);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error assigning roles", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Activate a user in the current admin's tenant.
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<UserResponse> activateTenantUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        try {
            UserResponse response = adminUserService.activateTenantUser(principal, id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error activating user", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Deactivate a user in the current admin's tenant.
     */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<UserResponse> deactivateTenantUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        try {
            UserResponse response = adminUserService.deactivateTenantUser(principal, id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error deactivating user", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Delete a user in the current admin's tenant.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTenantUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        try {
            adminUserService.deleteTenantUser(principal, id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Error deleting user", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
