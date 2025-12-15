package com.hust.auraflow.service.impl;

import com.hust.auraflow.service.KeycloakService;
import jakarta.ws.rs.core.Response;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
public class KeycloakServiceImpl implements KeycloakService {

    @Value("${keycloak.server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.admin-username}")
    private String adminUsername;

    @Value("${keycloak.admin-password}")
    private String adminPassword;

    private Keycloak getKeycloakAdminClient() {
        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm("master")
                .username(adminUsername)
                .password(adminPassword)
                .clientId("admin-cli")
                .build();
    }

    private RealmResource getRealm() {
        return getKeycloakAdminClient().realm(realm);
    }

    @Override
    public String createInvitedUser(String email) {
        UsersResource usersResource = getRealm().users();
        
        List<UserRepresentation> existingUsers = usersResource.searchByEmail(email, true);
        if (!existingUsers.isEmpty()) {
            String existingUserId = existingUsers.get(0).getId();
            log.warn("User with email {} already exists in Keycloak with ID: {}", email, existingUserId);
            return existingUserId;
        }

        UserRepresentation user = new UserRepresentation();
        user.setEnabled(true);
        user.setEmailVerified(false);
        user.setUsername(email);
        user.setEmail(email);
        
        user.setCredentials(Collections.emptyList());

        user.setRequiredActions(Arrays.asList(
            "VERIFY_EMAIL",
            "UPDATE_PASSWORD"
        ));

        Response response = usersResource.create(user);
        
        if (response.getStatus() == Response.Status.CREATED.getStatusCode()) {
            String location = response.getLocation().getPath();
            String userId = getUserIdFromLocation(location);
            response.close();
            return userId;
        } else {
            String errorMessage = response.readEntity(String.class);
            response.close();
            log.error("Failed to create user in Keycloak. Status: {}, Error: {}", 
                    response.getStatus(), errorMessage);
            throw new RuntimeException("Failed to create user in Keycloak: " + errorMessage);
        }
    }

    @Override
    public void sendInviteEmail(String keycloakUserId) {
        log.info("Sending invitation email to Keycloak user ID: {}", keycloakUserId);

        RealmResource realmResource = getRealm();
        UserResource userResource = realmResource.users().get(keycloakUserId);

        try {
            userResource.executeActionsEmail(Arrays.asList("VERIFY_EMAIL", "UPDATE_PASSWORD"));
        } catch (Exception e) {
            log.error("Failed to send invitation email to user ID: {}", keycloakUserId, e);
            throw new RuntimeException("Failed to send invitation email: " + e.getMessage(), e);
        }
    }

    private String getUserIdFromLocation(String location) {
        String[] parts = location.split("/");
        return parts[parts.length - 1];
    }
}

