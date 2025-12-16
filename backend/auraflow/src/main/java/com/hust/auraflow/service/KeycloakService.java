package com.hust.auraflow.service;

import com.hust.auraflow.dto.KeycloakTokenResult;

public interface KeycloakService {
    /**
     * Creates an invited user in Keycloak without password.
     * Sets required actions: VERIFY_EMAIL and UPDATE_PASSWORD.
     *
     * @param email User email address
     * @param tenantId Tenant ID used as metadata
     * @return Keycloak user ID
     */
    String createInvitedUser(String email, Long tenantId);

    /**
     * Sends invitation email to the user via Keycloak.
     *
     * @param keycloakUserId Keycloak user ID
     */
    void sendInviteEmail(String keycloakUserId);

    /**
     * Exchanges authorization code for tokens with Keycloak.
     *
     * @param code authorization code
     * @param redirectUri redirect URI used in the initial authorization request
     * @return tokens from Keycloak
     */
    KeycloakTokenResult exchangeCodeForTokens(String code, String redirectUri);
}


