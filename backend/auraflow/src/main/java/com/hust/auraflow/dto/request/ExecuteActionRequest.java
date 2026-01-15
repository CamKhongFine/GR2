package com.hust.auraflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecuteActionRequest {
    @NotBlank(message = "Action name is required")
    private String actionName;
    
    private String comment;
    
    private String dataBody;
    
    private List<FileUploadRequest> files;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileUploadRequest {
        private String fileName;
        private String objectName;
        private Long fileSize;
    }
}
