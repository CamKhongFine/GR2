package com.hust.auraflow.service;

import com.hust.auraflow.dto.CreateUserRequest;
import com.hust.auraflow.dto.UpdateUserRequest;
import com.hust.auraflow.dto.UserResponse;
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
    
    // CRUD operations
    Page<UserResponse> getAllUsers(Long id, String email, String status, Long tenantId, Pageable pageable);
    UserResponse getUserById(Long id);
    UserResponse updateUser(Long id, UpdateUserRequest request);
    void deleteUser(Long id);
    UserResponse activateUser(Long id);
    UserResponse deactivateUser(Long id);
}
