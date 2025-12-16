package com.hust.auraflow.service;

import com.hust.auraflow.dto.SessionData;

public interface SessionService {
    void saveSession(String sessionId, SessionData sessionData, long ttlSeconds);
    SessionData getSession(String sessionId);
    void deleteSession(String sessionId);
}


