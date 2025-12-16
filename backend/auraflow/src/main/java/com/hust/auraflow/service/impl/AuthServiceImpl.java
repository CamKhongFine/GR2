package com.hust.auraflow.service.impl;

import com.hust.auraflow.common.enums.InviteRequestStatus;
import com.hust.auraflow.common.enums.UserStatus;
import com.hust.auraflow.dto.*;
import com.hust.auraflow.entity.InviteRequest;
import com.hust.auraflow.entity.Role;
import com.hust.auraflow.entity.User;
import com.hust.auraflow.entity.UserRole;
import com.hust.auraflow.repository.InviteRequestRepository;
import com.hust.auraflow.repository.UserRepository;
import com.hust.auraflow.repository.UserRoleRepository;
import com.hust.auraflow.service.AuthService;
import com.hust.auraflow.service.KeycloakService;
import com.hust.auraflow.service.RabbitMQProducer;
import com.hust.auraflow.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final InviteRequestRepository inviteRequestRepository;
    private final RabbitMQProducer rabbitMQProducer;
    private final UserRoleRepository userRoleRepository;
    private final SessionService sessionService;
    private final KeycloakService keycloakService;
    private final JwtDecoder jwtDecoder;

    @Override
    @Transactional
    public InviteResponse inviteUser(InviteRequestDTO request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            log.warn("User with email {} already exists", request.getEmail());
            throw new IllegalArgumentException("User with this email already exists");
        }

        InviteRequest inviteRequest = new InviteRequest();
        inviteRequest.setEmail(request.getEmail());
        inviteRequest.setTenantId(request.getTenantId());
        inviteRequest.setStatus(InviteRequestStatus.PENDING);
        inviteRequest.setRetryCount(0);

        InviteRequest saved = inviteRequestRepository.save(inviteRequest);

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                rabbitMQProducer.publish(saved.getId());
            }
        });

        return new InviteResponse("Invite request accepted");
    }

    @Override
    @Transactional
    public UserResponse getCurrentUser(Jwt jwt) {
        if (jwt == null) {
            log.warn("JWT token is null");
            throw new IllegalArgumentException("JWT token is required");
        }

        String sub = jwt.getClaimAsString("sub");
        String email = jwt.getClaimAsString("email");
        Boolean emailVerified = jwt.getClaimAsBoolean("email_verified");

        if (emailVerified == null || !emailVerified) {
            log.warn("Email not verified for user: {}", email);
            throw new IllegalStateException("Email not verified");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found in database for email: {}", email);
                    return new RuntimeException("User not found");
                });
        if (user.getStatus() != UserStatus.ACTIVE || user.getKeycloakSub() == null) {
            user.setKeycloakSub(sub);
            user.setStatus(UserStatus.ACTIVE);
            userRepository.save(user);
        }
        return UserResponse.fromEntity(user);
    }

    @Override
    public String handleKeycloakCallback(String code) {
        KeycloakTokenResult tokenResult = keycloakService.exchangeCodeForTokens(code);

        Jwt jwt = jwtDecoder.decode(tokenResult.getIdToken());
        String sub = jwt.getClaimAsString("sub");
        if (sub == null) {
            throw new IllegalStateException("sub not found in id_token");
        }

        User user = userRepository.findByKeycloakSub(sub)
                .orElseThrow(() -> new IllegalStateException("User not found for sub=" + sub));

        List<UserRole> userRoles = userRoleRepository.findByIdUserId(user.getId());
        Set<Long> roleIds = userRoles.stream()
                .map(UserRole::getRole)
                .filter(java.util.Objects::nonNull)
                .map(Role::getId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());

        String sessionId = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plusSeconds(tokenResult.getRefreshExpiresIn());

        SessionData sessionData = SessionData.builder()
                .userId(user.getId())
                .tenantId(user.getTenantId())
                .roleIds(roleIds)
                .accessToken(tokenResult.getAccessToken())
                .refreshToken(tokenResult.getRefreshToken())
                .expiresAt(expiresAt)
                .build();

        sessionService.saveSession(sessionId, sessionData, tokenResult.getRefreshExpiresIn());
        return sessionId;
    }
}