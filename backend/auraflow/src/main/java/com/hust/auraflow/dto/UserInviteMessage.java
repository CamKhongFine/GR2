package com.hust.auraflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInviteMessage implements Serializable {
    private Long userId;
    private String email;
    private String keycloakUserId;
}

