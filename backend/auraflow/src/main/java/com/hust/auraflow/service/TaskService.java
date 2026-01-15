package com.hust.auraflow.service;

import com.hust.auraflow.dto.request.CreateTaskRequest;
import com.hust.auraflow.dto.request.UpdateTaskRequest;
import com.hust.auraflow.dto.response.TaskResponse;
import com.hust.auraflow.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TaskService {
    Page<TaskResponse> getTasks(UserPrincipal principal, Long projectId, String title, String status,
            String priority, Long creatorId, Pageable pageable);

    TaskResponse getTaskById(UserPrincipal principal, Long taskId);

    TaskResponse createTask(UserPrincipal principal, CreateTaskRequest request);

    TaskResponse updateTask(UserPrincipal principal, Long taskId, UpdateTaskRequest request);

    void deleteTask(UserPrincipal principal, Long taskId);
}
