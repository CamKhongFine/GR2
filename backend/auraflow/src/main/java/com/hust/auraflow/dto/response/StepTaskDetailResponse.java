package com.hust.auraflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StepTaskDetailResponse {
    private StepTaskResponse stepTask;
    private String comment;
    private List<StepTaskDataResponse> data;
    private List<StepTaskFileResponse> files;
}
