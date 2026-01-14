package com.hust.auraflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecuteActionRequest {
    @NotBlank(message = "Action name is required")
    private String actionName;
    
    private String comment;
}
