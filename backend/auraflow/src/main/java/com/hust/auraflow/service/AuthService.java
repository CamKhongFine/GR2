package com.hust.auraflow.service;

import com.hust.auraflow.dto.request.InviteRequestDTO;
import com.hust.auraflow.dto.response.InviteResponse;
import com.hust.auraflow.dto.SessionData;

public interface AuthService {
    /**
     * Invites a new user by creating them in Keycloak and database.
     * 
     * @param request Invite request containing email and tenantId
     * @return Invite response
     */
    InviteResponse inviteUser(InviteRequestDTO request);

    String handleKeycloakCallback(String code, String redirectUri);
    
    SessionData getSessionData(String sessionId);
    
    void clearSession(String sessionId);
}
