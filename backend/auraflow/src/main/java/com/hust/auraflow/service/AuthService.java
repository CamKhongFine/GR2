package com.hust.auraflow.service;

import com.hust.auraflow.dto.InviteRequestDTO;
import com.hust.auraflow.dto.InviteResponse;
import com.hust.auraflow.dto.SessionData;
import com.hust.auraflow.dto.UserResponse;
import com.hust.auraflow.security.UserPrincipal;

public interface AuthService {
    /**
     * Invites a new user by creating them in Keycloak and database.
     * 
     * @param request Invite request containing email and tenantId
     * @return Invite response
     */
    InviteResponse inviteUser(InviteRequestDTO request);

    /**
     * Gets current user information from UserPrincipal (session-based).
     * 
     * @param principal UserPrincipal from SecurityContext
     * @return User response
     */
    UserResponse getCurrentUser(UserPrincipal principal);

    String handleKeycloakCallback(String code, String redirectUri);
    
    SessionData getSessionData(String sessionId);
}

