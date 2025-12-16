package com.hust.auraflow.controller;

import com.hust.auraflow.dto.DivisionResponse;
import com.hust.auraflow.service.DivisionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/divisions")
@RequiredArgsConstructor
public class DivisionController {

    private final DivisionService divisionService;

    @GetMapping
    public ResponseEntity<List<DivisionResponse>> getAllDivisions() {
        return ResponseEntity.ok(divisionService.getAllDivisions());
    }
}

