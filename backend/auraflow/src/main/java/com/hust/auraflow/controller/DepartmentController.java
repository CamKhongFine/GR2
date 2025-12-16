package com.hust.auraflow.controller;

import com.hust.auraflow.dto.DepartmentResponse;
import com.hust.auraflow.security.UserPrincipal;
import com.hust.auraflow.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<List<DepartmentResponse>> getDepartments(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(departmentService.getDepartmentsByTenant(principal.getTenantId()));
    }
}

