package com.hust.auraflow.service;

import com.hust.auraflow.dto.request.UpdateUserRequest;
import com.hust.auraflow.dto.response.UserResponse;
import com.hust.auraflow.dto.response.UserRoleResponse;
import com.hust.auraflow.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    /**
     * Gets current user information from UserPrincipal (session-based).
     * 
     * @param principal UserPrincipal from SecurityContext
     * @return User response
     */
    UserResponse getCurrentUser(UserPrincipal principal);

    /**
     * Updates current user information.
     * 
     * @param principal UserPrincipal from SecurityContext
     * @param request Update request containing fields to update
     * @return Updated user response
     */
    UserResponse updateCurrentUser(UserPrincipal principal, UpdateUserRequest request);
    
    /**
     * Gets user's effective role level for routing purposes.
     * 
     * @param userId User ID
     * @return User role response with effective role level
     */
    UserRoleResponse getUserRole(Long userId);
    
    // CRUD operations
    Page<UserResponse> getAllUsers(Long id, String email, String status, Long tenantId, Integer roleLevel, Pageable pageable);
    UserResponse getUserById(Long id);
    UserResponse updateUser(Long id, UpdateUserRequest request);
    void deleteUser(Long id);
    UserResponse activateUser(Long id);
    UserResponse deactivateUser(Long id);
}
