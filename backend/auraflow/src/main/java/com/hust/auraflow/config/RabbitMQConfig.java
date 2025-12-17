package com.hust.auraflow.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.retry.RejectAndDontRequeueRecoverer;
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
    public static final String INVITE_USER_DLQ_KEY = "user.invite.dlq";

    // User Deletion Queue Configuration
    public static final String DELETE_USER_EXCHANGE = "delete.user.exchange";
    public static final String DELETE_USER_COMMAND_QUEUE = "delete.user.queue";
    public static final String DELETE_USER_COMMAND_KEY = "user.delete.command";
    
    public static final String DELETE_USER_DLX = "delete.user.dlx";
    public static final String DELETE_USER_DLQ = "delete.user.dlq";
    public static final String DELETE_USER_DLQ_KEY = "user.delete.dlq";

    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(INVITE_USER_EXCHANGE, true, false);
    }

    @Bean
    public Queue inviteUserQueue() {
        return QueueBuilder.durable(INVITE_USER_COMMAND_QUEUE)
                .withArgument("x-dead-letter-exchange", INVITE_USER_DLX)
                .withArgument("x-dead-letter-routing-key", INVITE_USER_DLQ_KEY)
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
                .with(INVITE_USER_DLQ_KEY);
    }

    // User Deletion Beans
    @Bean
    public TopicExchange deleteUserExchange() {
        return new TopicExchange(DELETE_USER_EXCHANGE, true, false);
    }

    @Bean
    public Queue deleteUserQueue() {
        return QueueBuilder.durable(DELETE_USER_COMMAND_QUEUE)
                .withArgument("x-dead-letter-exchange", DELETE_USER_DLX)
                .withArgument("x-dead-letter-routing-key", DELETE_USER_DLQ_KEY)
                .build();
    }

    @Bean
    public TopicExchange deleteUserDlx() {
        return new TopicExchange(DELETE_USER_DLX, true, false);
    }

    @Bean
    public Queue deleteUserDlq() {
        return QueueBuilder.durable(DELETE_USER_DLQ).build();
    }

    @Bean
    public Binding deleteUserBinding() {
        return BindingBuilder
                .bind(deleteUserQueue())
                .to(deleteUserExchange())
                .with(DELETE_USER_COMMAND_KEY);
    }

    @Bean
    public Binding deleteUserDlqBinding() {
        return BindingBuilder
                .bind(deleteUserDlq())
                .to(deleteUserDlx())
                .with(DELETE_USER_DLQ_KEY);
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

        factory.setDefaultRequeueRejected(false);

        factory.setAdviceChain(
                RetryInterceptorBuilder.stateless()
                        .maxRetries(3)
                        .backOffOptions(2000, 2.0, 10000)
                        .recoverer(new RejectAndDontRequeueRecoverer())
                        .build()
        );

        return factory;
    }
}

