package com.hust.auraflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogoutUserCommand {
    private String keycloakSub;
    private String email;
}
