package com.hust.auraflow.controller;

import com.hust.auraflow.dto.CreateDivisionRequest;
import com.hust.auraflow.dto.DivisionResponse;
import com.hust.auraflow.dto.UpdateDivisionRequest;
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
}
