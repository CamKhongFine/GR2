package com.hust.auraflow.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String INVITE_USER_EXCHANGE = "invite.user.exchange";
    public static final String INVITE_USER_COMMAND_QUEUE = "invite.user.queue";
    public static final String INVITE_USER_COMMAND_KEY = "user.invite.command";

    public static final String INVITE_USER_DLX = "invite.user.dlx";
    public static final String INVITE_USER_DLQ = "invite.user.dlq";

    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(INVITE_USER_EXCHANGE, true, false);
    }

    @Bean
    public Queue inviteUserQueue() {
        return QueueBuilder.durable(INVITE_USER_COMMAND_QUEUE)
                .withArgument("x-dead-letter-exchange", INVITE_USER_DLX)
                .withArgument("x-dead-letter-routing-key", INVITE_USER_DLQ)
                .build();
    }

    @Bean
    public TopicExchange inviteUserDlx() {
        return new TopicExchange(INVITE_USER_DLX, true, false);
    }

    @Bean
    public Queue inviteUserDlq() {
        return QueueBuilder.durable(INVITE_USER_DLQ).build();
    }

    @Bean
    public Binding inviteUserBinding() {
        return BindingBuilder
                .bind(inviteUserQueue())
                .to(userExchange())
                .with(INVITE_USER_COMMAND_KEY);
    }

    @Bean
    public Binding inviteUserDlqBinding() {
        return BindingBuilder
                .bind(inviteUserDlq())
                .to(inviteUserDlx())
                .with(INVITE_USER_DLQ);
    }

    @Bean
    public MessageConverter messageConverter() {
        return new JacksonJsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter());
        return factory;
    }
}

