package com.hust.auraflow.service.impl;

import com.hust.auraflow.dto.SessionData;
import com.hust.auraflow.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class SessionServiceImpl implements SessionService {

    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public void saveSession(String sessionId, SessionData sessionData, long ttlSeconds) {
        redisTemplate.opsForValue().set(buildKey(sessionId), sessionData, Duration.ofSeconds(ttlSeconds));
    }

    @Override
    public SessionData getSession(String sessionId) {
        Object value = redisTemplate.opsForValue().get(buildKey(sessionId));
        if (value instanceof SessionData data) {
            return data;
        }
        return null;
    }

    @Override
    public void deleteSession(String sessionId) {
        redisTemplate.delete(buildKey(sessionId));
    }

    private String buildKey(String sessionId) {
        return "session:" + sessionId;
    }
}


