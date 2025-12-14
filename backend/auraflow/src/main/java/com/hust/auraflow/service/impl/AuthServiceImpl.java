package com.hust.auraflow.service.impl;

import com.hust.auraflow.common.enums.UserStatus;
import com.hust.auraflow.dto.InviteRequest;
import com.hust.auraflow.dto.InviteResponse;
import com.hust.auraflow.dto.UserResponse;
import com.hust.auraflow.entity.User;
import com.hust.auraflow.repository.UserRepository;
import com.hust.auraflow.service.AuthService;
import com.hust.auraflow.service.KeycloakService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final KeycloakService keycloakService;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public InviteResponse inviteUser(InviteRequest request) {
        log.info("Inviting user with email: {}, tenantId: {}", request.getEmail(), request.getTenantId());

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            log.warn("User with email {} already exists", request.getEmail());
            throw new IllegalArgumentException("User with this email already exists");
        }

        String keycloakUserId = keycloakService.createInvitedUser(request.getEmail());

        User user = User.builder()
                .email(request.getEmail())
                .tenantId(request.getTenantId())
                .status(UserStatus.INVITED)
                .keycloakSub(null)
                .build();

        userRepository.save(user);

        keycloakService.sendInviteEmail(keycloakUserId);

        log.info("Successfully invited user with email: {}", request.getEmail());
        return new InviteResponse("Invitation email sent");
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

        log.info("Getting current user for email: {}, sub: {}", email, sub);

        if (emailVerified == null || !emailVerified) {
            log.warn("Email not verified for user: {}", email);
            throw new IllegalStateException("Email not verified");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found in database for email: {}", email);
                    return new RuntimeException("User not found");
                });

        user.setKeycloakSub(sub);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        log.info("Successfully updated and retrieved user: {}", email);
        return UserResponse.fromEntity(user);
    }
}

