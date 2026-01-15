package com.hust.auraflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KeycloakTokenResult {
    private String accessToken;
    private String refreshToken;
    private String idToken;
    private int refreshExpiresIn;
}


