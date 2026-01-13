package com.hust.auraflow.service;

import com.hust.auraflow.dto.response.InviteResponse;
import com.hust.auraflow.dto.request.UpdateUserRequest;
import com.hust.auraflow.dto.response.UserResponse;
import com.hust.auraflow.entity.Role;
import com.hust.auraflow.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service for Admin-scoped user management operations.
 * All operations are restricted to the admin's tenant and respect role hierarchy.
 */
public interface AdminUserService {
    
    /**
     * Get all users in the current admin's tenant with pagination and filters.
     * 
     * @param principal Current admin's principal
     * @param email Email filter (optional)
     * @param status Status filter (optional)
     * @param roleLevel Role level filter (optional)
     * @param pageable Pagination parameters
     * @return Paginated list of users in the admin's tenant
     */
    Page<UserResponse> getTenantUsers(
            UserPrincipal principal,
            String email,
            String status,
            Integer roleLevel,
            Pageable pageable
    );
    
    /**
     * Invite a user to the current admin's tenant.
     * 
     * @param principal Current admin's principal
     * @param email Email of the user to invite
     * @return Invite response
     */
    InviteResponse inviteTenantUser(UserPrincipal principal, String email);
    
    /**
     * Get roles that the current admin can assign (roles with level > admin's level).
     * 
     * @param principal Current admin's principal
     * @return List of assignable roles
     */
    List<Role> getAvailableRoles(UserPrincipal principal);
    
    /**
     * Update a user in the current admin's tenant.
     * 
     * @param principal Current admin's principal
     * @param userId User ID to update
     * @param request Update request
     * @return Updated user response
     * @throws IllegalArgumentException if user not in admin's tenant
     */
    UserResponse updateTenantUser(UserPrincipal principal, Long userId, UpdateUserRequest request);
    
    /**
     * Assign roles to a user in the current admin's tenant.
     * Only roles with level > admin's level can be assigned.
     * 
     * @param principal Current admin's principal
     * @param userId User ID
     * @param roleIds List of role IDs to assign
     * @return Updated user response
     * @throws IllegalArgumentException if user not in tenant or roles invalid
     */
    UserResponse assignRolesToTenantUser(UserPrincipal principal, Long userId, List<Long> roleIds);
    
    /**
     * Activate a user in the current admin's tenant.
     * 
     * @param principal Current admin's principal
     * @param userId User ID to activate
     * @return Updated user response
     * @throws IllegalArgumentException if user not in admin's tenant
     */
    UserResponse activateTenantUser(UserPrincipal principal, Long userId);
    
    /**
     * Deactivate a user in the current admin's tenant.
     * 
     * @param principal Current admin's principal
     * @param userId User ID to deactivate
     * @return Updated user response
     * @throws IllegalArgumentException if user not in admin's tenant
     */
    UserResponse deactivateTenantUser(UserPrincipal principal, Long userId);
    
    /**
     * Delete a user in the current admin's tenant.
     * 
     * @param principal Current admin's principal
     * @param userId User ID to delete
     * @throws IllegalArgumentException if user not in admin's tenant
     */
    void deleteTenantUser(UserPrincipal principal, Long userId);
}
