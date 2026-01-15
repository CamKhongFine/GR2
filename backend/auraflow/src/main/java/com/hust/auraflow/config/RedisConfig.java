package com.hust.auraflow.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.hust.auraflow.dto.SessionData;
import org.jspecify.annotations.Nullable;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.RedisSerializer;

import java.util.LinkedHashMap;

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        RedisSerializer<String> keySerializer = RedisSerializer.string();
        
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        
        RedisSerializer<Object> valueSerializer = new RedisSerializer<>() {

            @Override
            public byte[] serialize(Object value) {
                if (value == null) {
                    return new byte[0];
                }
                try {
                    return objectMapper.writeValueAsBytes(value);
                } catch (Exception e) {
                    throw new RuntimeException("Error serializing object", e);
                }
            }

            @Override
            @Nullable
            public Object deserialize(byte @Nullable [] bytes) {
                if (bytes == null || bytes.length == 0) {
                    return null;
                }
                try {
                    try {
                        return objectMapper.readValue(bytes, SessionData.class);
                    } catch (Exception e) {
                        Object obj = objectMapper.readValue(bytes, Object.class);
                        if (obj instanceof LinkedHashMap) {
                            return objectMapper.convertValue(obj, SessionData.class);
                        }
                        return obj;
                    }
                } catch (Exception e) {
                    throw new RuntimeException("Error deserializing object", e);
                }
            }
        };

        template.setKeySerializer(keySerializer);
        template.setHashKeySerializer(keySerializer);
        template.setValueSerializer(valueSerializer);
        template.setHashValueSerializer(valueSerializer);

        template.afterPropertiesSet();
        return template;
    }
}


