package com.hust.auraflow.service;

import com.hust.auraflow.config.RabbitMQConfig;
import com.hust.auraflow.dto.InviteUserCommand;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RabbitMQProducer {

    private final RabbitTemplate rabbitTemplate;

    public void publish(Long inviteRequestId) {
        InviteUserCommand command = new InviteUserCommand(inviteRequestId);
        log.info("Publishing InviteUserCommand for inviteRequestId={}", inviteRequestId);

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.INVITE_USER_EXCHANGE,
                RabbitMQConfig.INVITE_USER_COMMAND_KEY,
                command
        );
    }
}

