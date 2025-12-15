package com.hust.auraflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InviteUserCommand implements Serializable {
    private Long inviteRequestId;
}

