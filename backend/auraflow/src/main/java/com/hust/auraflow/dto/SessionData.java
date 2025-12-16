package com.hust.auraflow.dto;

import lombok.Builder;
import lombok.Getter;

import java.io.Serializable;
import java.time.Instant;
import java.util.Set;

@Getter
@Builder
public class SessionData implements Serializable {
    private final Long userId;
    private final Long tenantId;
    private final Set<Long> roleIds;
    private final String accessToken;
    private final String refreshToken;
    private final Instant expiresAt;
}


