package com.hust.auraflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;
import java.util.Set;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionData implements Serializable {
    private Long userId;
    private Long tenantId;
    private Set<Long> roleIds;
    private String accessToken;
    private String refreshToken;
    private Instant expiresAt;
}


