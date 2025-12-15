package com.hust.auraflow.config;

import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.connection.AbstractConnectionFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitDebugConfig {

    @Bean
    public Object rabbitDebug(ConnectionFactory cf) {
        if (cf instanceof AbstractConnectionFactory acf) {
            System.out.println("🐰 Rabbit host     = " + acf.getHost());
            System.out.println("🐰 Rabbit port     = " + acf.getPort());
            System.out.println("🐰 Rabbit username = " + acf.getUsername());
        } else {
            System.out.println("Rabbit ConnectionFactory type = " + cf.getClass());
        }
        return new Object();
    }
}