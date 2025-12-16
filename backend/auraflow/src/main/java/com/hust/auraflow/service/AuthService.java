package com.hust.auraflow.service;

import com.hust.auraflow.dto.InviteRequestDTO;
import com.hust.auraflow.dto.InviteResponse;
import com.hust.auraflow.dto.UserResponse;
import org.springframework.security.oauth2.jwt.Jwt;

public interface AuthService {
    /**
     * Invites a new user by creating them in Keycloak and database.
     * 
     * @param request Invite request containing email and tenantId
     * @return Invite response
     */
    InviteResponse inviteUser(InviteRequestDTO request);

    /**
     * Gets current user information from JWT and syncs with database.
     * 
     * @param jwt JWT token from authentication
     * @return User response
     */
    UserResponse getCurrentUser(Jwt jwt);

    String handleKeycloakCallback(String code);
}

