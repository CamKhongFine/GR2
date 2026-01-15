package com.hust.auraflow.service;

import com.hust.auraflow.dto.response.DivisionResponse;

import java.util.List;

public interface DivisionService {
    /**
     * Gets all divisions.
     * 
     * @return List of divisions
     */
    List<DivisionResponse> getAllDivisions();
}

