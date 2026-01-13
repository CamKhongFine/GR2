package com.hust.auraflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoleRequest {

    @NotBlank
    private String name;

    @NotNull
    private Integer level;

    private String description;
}


