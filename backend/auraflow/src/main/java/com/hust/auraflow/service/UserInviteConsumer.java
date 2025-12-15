package com.hust.auraflow.service;

import com.hust.auraflow.config.RabbitMQConfig;
import com.hust.auraflow.dto.UserInviteMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserInviteConsumer {

    @Value("${keycloak.server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.admin-username}")
    private String adminUsername;

    @Value("${keycloak.admin-password}")
    private String adminPassword;

    @RabbitListener(queues = RabbitMQConfig.USER_INVITE_QUEUE)
    public void handleInviteMessage(UserInviteMessage message) {
        log.info("Received invite message for user ID: {}, email: {}, keycloakUserId: {}", 
                message.getUserId(), message.getEmail(), message.getKeycloakUserId());

        try {
            sendInviteEmail(message.getKeycloakUserId());
            log.info("Successfully sent invitation email for user ID: {}, email: {}", 
                    message.getUserId(), message.getEmail());
        } catch (Exception e) {
            log.error("Failed to send invitation email for user ID: {}, email: {}", 
                    message.getUserId(), message.getEmail(), e);
            throw new RuntimeException("Failed to send invitation email", e);
        }
    }

    private void sendInviteEmail(String keycloakUserId) {
        log.info("Sending invitation email to Keycloak user ID: {}", keycloakUserId);

        try (Keycloak keycloak = KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm("master")
                .username(adminUsername)
                .password(adminPassword)
                .clientId("admin-cli")
                .build()) {

            RealmResource realmResource = keycloak.realm(realm);
            UserResource userResource = realmResource.users().get(keycloakUserId);

            userResource.executeActionsEmail(Arrays.asList("VERIFY_EMAIL", "UPDATE_PASSWORD"));

            log.info("Successfully sent invitation email to Keycloak user ID: {}", keycloakUserId);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
        }

    }
}

