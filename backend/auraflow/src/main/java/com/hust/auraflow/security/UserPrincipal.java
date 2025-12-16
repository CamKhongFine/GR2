package com.hust.auraflow.security;

import lombok.Builder;
import lombok.Getter;

import java.io.Serializable;
import java.util.Set;

@Getter
@Builder
public class UserPrincipal implements Serializable {
    private final Long userId;
    private final Long tenantId;
    private final Set<Long> roleIds;
}


