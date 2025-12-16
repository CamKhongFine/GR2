package com.hust.auraflow.service;

public interface KeycloakService {
    /**
     * Creates an invited user in Keycloak without password.
     * Sets required actions: VERIFY_EMAIL and UPDATE_PASSWORD.
     * 
     * @param email User email address
     * @param tenantId Tenant ID used as metadata
     * @param roleId Role ID to resolve role name for metadata
     * @return Keycloak user ID
     */
    String createInvitedUser(String email, Long tenantId, Long roleId);

    /**
     * Sends invitation email to the user via Keycloak.
     * 
     * @param keycloakUserId Keycloak user ID
     */
    void sendInviteEmail(String keycloakUserId);
}

