package com.hust.auraflow.controller;

import com.hust.auraflow.dto.request.CreateDivisionRequest;
import com.hust.auraflow.dto.request.UpdateDivisionRequest;
import com.hust.auraflow.dto.response.DepartmentResponse;
import com.hust.auraflow.dto.response.DivisionResponse;
import com.hust.auraflow.dto.response.UserResponse;
import com.hust.auraflow.security.UserPrincipal;
import com.hust.auraflow.service.AdminDivisionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/admin/divisions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDivisionController {

    private final AdminDivisionService adminDivisionService;

    @GetMapping
    public ResponseEntity<Page<DivisionResponse>> getTenantDivisions(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String name,
            Pageable pageable) {
        try {
            Page<DivisionResponse> divisions = adminDivisionService.getTenantDivisions(
                    principal, name, pageable);
            return ResponseEntity.ok(divisions);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Error getting tenant divisions", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping
    public ResponseEntity<DivisionResponse> createDivision(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateDivisionRequest request) {
        try {
            DivisionResponse response = adminDivisionService.createDivision(principal, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Error creating division", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<DivisionResponse> updateDivision(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateDivisionRequest request) {
        try {
            DivisionResponse response = adminDivisionService.updateDivision(principal, id, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error updating division", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDivision(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        try {
            adminDivisionService.deleteDivision(principal, id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Error deleting division", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<DivisionResponse> getDivisionById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        try {
            DivisionResponse response = adminDivisionService.getDivisionById(principal, id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error getting division", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/{divisionId}/departments/{departmentId}")
    public ResponseEntity<Void> assignDepartmentToDivision(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long divisionId,
            @PathVariable Long departmentId) {
        try {
            adminDivisionService.assignDepartmentToDivision(principal, divisionId, departmentId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.error("Error assigning department to division", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{divisionId}/departments/{departmentId}")
    public ResponseEntity<Void> removeDepartmentFromDivision(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long divisionId,
            @PathVariable Long departmentId) {
        try {
            adminDivisionService.removeDepartmentFromDivision(principal, divisionId, departmentId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Error removing department from division", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{divisionId}/members/{userId}")
    public ResponseEntity<Void> assignMemberToDivision(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long divisionId,
            @PathVariable Long userId) {
        try {
            adminDivisionService.assignMemberToDivision(principal, divisionId, userId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.error("Error assigning member to division", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{divisionId}/members/{userId}")
    public ResponseEntity<Void> removeMemberFromDivision(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long divisionId,
            @PathVariable Long userId) {
        try {
            adminDivisionService.removeMemberFromDivision(principal, divisionId, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Error removing member from division", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{divisionId}/departments")
    public ResponseEntity<Page<DepartmentResponse>> getDivisionDepartments(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long divisionId,
            @RequestParam(required = false) String name,
            Pageable pageable) {
        try {
            Page<DepartmentResponse> departments = 
                    adminDivisionService.getDivisionDepartments(principal, divisionId, name, pageable);
            return ResponseEntity.ok(departments);
        } catch (IllegalArgumentException e) {
            log.error("Error getting division departments", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{divisionId}/members")
    public ResponseEntity<Page<UserResponse>> getDivisionMembers(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long divisionId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        try {
            Page<UserResponse> members = 
                    adminDivisionService.getDivisionMembers(principal, divisionId, departmentId, search, pageable);
            return ResponseEntity.ok(members);
        } catch (IllegalArgumentException e) {
            log.error("Error getting division members", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
