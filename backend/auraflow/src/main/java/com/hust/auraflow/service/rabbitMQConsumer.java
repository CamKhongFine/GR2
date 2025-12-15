package com.hust.auraflow.service;

import com.hust.auraflow.common.Config;
import com.hust.auraflow.common.enums.InviteRequestStatus;
import com.hust.auraflow.common.enums.UserStatus;
import com.hust.auraflow.config.RabbitMQConfig;
import com.hust.auraflow.dto.InviteUserCommand;
import com.hust.auraflow.entity.InviteRequest;
import com.hust.auraflow.entity.User;
import com.hust.auraflow.repository.InviteRequestRepository;
import com.hust.auraflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class rabbitMQConsumer {

    private final InviteRequestRepository inviteRequestRepository;
    private final UserRepository userRepository;
    private final KeycloakService keycloakService;

    @RabbitListener(queues = RabbitMQConfig.INVITE_USER_COMMAND_QUEUE)
    @Transactional
    public void handleInviteCommand(InviteUserCommand command) {
        Long inviteRequestId = command.getInviteRequestId();
        InviteRequest inviteRequest = inviteRequestRepository.findById(inviteRequestId)
                .orElse(null);

        if (inviteRequest == null) {
            log.warn("InviteRequest not found inviteRequestId={}", inviteRequestId);
            return;
        }

        if (inviteRequest.getStatus() == InviteRequestStatus.COMPLETED) {
            return;
        }
        if (inviteRequest.getStatus() == InviteRequestStatus.FAILED) {
            log.warn("InviteRequest already failed inviteRequestId={}", inviteRequestId);
            return;
        }

        try {
            if (userRepository.findByEmail(inviteRequest.getEmail()).isPresent()) {
                inviteRequest.setStatus(InviteRequestStatus.COMPLETED);
                inviteRequest.setErrorMessage(null);
                inviteRequestRepository.save(inviteRequest);
                return;
            }

            String keycloakUserId = keycloakService.createInvitedUser(inviteRequest.getEmail());

            User user = User.builder()
                    .email(inviteRequest.getEmail())
                    .tenantId(inviteRequest.getTenantId())
                    .status(UserStatus.INVITED)
                    .keycloakSub(keycloakUserId)
                    .build();
            userRepository.save(user);

            keycloakService.sendInviteEmail(keycloakUserId);

            inviteRequest.setStatus(InviteRequestStatus.COMPLETED);
            inviteRequest.setErrorMessage(null);
            inviteRequestRepository.save(inviteRequest);

        } catch (Exception e) {
            log.error("Invite processing failed inviteRequestId={}, email={}, retryCount={}",
                    inviteRequestId, inviteRequest.getEmail(), inviteRequest.getRetryCount(), e);

            int newRetry = inviteRequest.getRetryCount() + 1;
            inviteRequest.setRetryCount(newRetry);
            inviteRequest.setErrorMessage(e.getMessage());

            if (newRetry >= Config.MAX_INVITE_RETRY) {
                inviteRequest.setStatus(InviteRequestStatus.FAILED);
                inviteRequestRepository.save(inviteRequest);
                log.error("Invite marked FAILED after max retries inviteRequestId={}", inviteRequestId);
                throw new AmqpRejectAndDontRequeueException("Max retries exceeded for inviteRequestId=" + inviteRequestId, e);
            } else {
                inviteRequestRepository.save(inviteRequest);
                throw e;
            }
        }
    }

}

