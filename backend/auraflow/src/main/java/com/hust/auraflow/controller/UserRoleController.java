package com.hust.auraflow.controller;

import com.hust.auraflow.dto.request.AssignRolesRequest;
import com.hust.auraflow.dto.response.UserResponse;
import com.hust.auraflow.service.UserRoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/user-roles")
@RequiredArgsConstructor
public class UserRoleController {

    private final UserRoleService userRoleService;

    @PostMapping("/assign")
    public ResponseEntity<UserResponse> assignRoles(@Valid @RequestBody AssignRolesRequest request) {
        try {
            UserResponse response = userRoleService.assignRoles(request.getUserId(), request.getRoleIds());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error assigning roles", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{userId}/roles/{roleId}")
    public ResponseEntity<UserResponse> unassignRole(
            @PathVariable Long userId,
            @PathVariable Long roleId) {
        try {
            UserResponse response = userRoleService.unassignRole(userId, roleId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error unassigning role", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserRoles(@PathVariable Long userId) {
        try {
            UserResponse response = userRoleService.getUserRoles(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error getting user roles", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
