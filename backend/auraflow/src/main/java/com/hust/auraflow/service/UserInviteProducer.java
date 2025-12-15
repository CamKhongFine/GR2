package com.hust.auraflow.service;

import com.hust.auraflow.config.RabbitMQConfig;
import com.hust.auraflow.dto.UserInviteMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserInviteProducer {

    private final RabbitTemplate rabbitTemplate;

    public void publishInviteMessage(UserInviteMessage message) {
        log.info("Publishing invite message for user ID: {}, email: {}", message.getUserId(), message.getEmail());
        
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.USER_EXCHANGE,
                RabbitMQConfig.USER_INVITED_ROUTING_KEY,
                message
        );
        
        log.info("Successfully published invite message for user ID: {}", message.getUserId());
    }
}

