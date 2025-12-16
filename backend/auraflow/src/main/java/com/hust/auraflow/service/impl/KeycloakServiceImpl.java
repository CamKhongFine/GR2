package com.hust.auraflow.service.impl;

import com.hust.auraflow.dto.KeycloakTokenResult;
import com.hust.auraflow.service.KeycloakService;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class KeycloakServiceImpl implements KeycloakService {

    @Value("${keycloak.server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.admin-username}")
    private String adminUsername;

    @Value("${keycloak.admin-password}")
    private String adminPassword;

    @Value("${keycloak.client-id}")
    private String clientId;

    private final RestTemplate restTemplate = new RestTemplate();

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
    public String createInvitedUser(String email, Long tenantId) {
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

        Map<String, List<String>> attributes = new HashMap<>();
        attributes.put("tenantId", Collections.singletonList(String.valueOf(tenantId)));
        user.setAttributes(attributes);

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

    @Override
    public KeycloakTokenResult exchangeCodeForTokens(String code, String redirectUri) {
        String tokenEndpoint = serverUrl + "/realms/" + realm + "/protocol/openid-connect/token";

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("code", code);
        body.add("client_id", clientId);
        body.add("redirect_uri", redirectUri);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<Map<String, Object>> tokenResponse = restTemplate.exchange(
                tokenEndpoint,
                HttpMethod.POST,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<>() {
                }
        );

        if (!tokenResponse.getStatusCode().is2xxSuccessful() || tokenResponse.getBody() == null) {
            throw new IllegalStateException("Failed to exchange code with Keycloak");
        }

        Map<String, Object> payload = tokenResponse.getBody();
        String accessToken = (String) payload.get("access_token");
        String refreshToken = (String) payload.get("refresh_token");
        String idToken = (String) payload.get("id_token");
        Integer refreshExpiresIn = (Integer) payload.getOrDefault("refresh_expires_in", 1800);

        if (accessToken == null || refreshToken == null || idToken == null) {
            throw new IllegalStateException("Missing tokens from Keycloak response");
        }

        return KeycloakTokenResult.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .idToken(idToken)
                .refreshExpiresIn(refreshExpiresIn)
                .build();
    }

    private String getUserIdFromLocation(String location) {
        String[] parts = location.split("/");
        return parts[parts.length - 1];
    }
}

