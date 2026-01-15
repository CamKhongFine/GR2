package com.hust.auraflow.service.impl;

import com.hust.auraflow.dto.response.DivisionResponse;
import com.hust.auraflow.repository.DivisionRepository;
import com.hust.auraflow.service.DivisionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DivisionServiceImpl implements DivisionService {

    private final DivisionRepository divisionRepository;

    @Override
    public List<DivisionResponse> getAllDivisions() {
        return divisionRepository.findAll().stream()
                .map(div -> DivisionResponse.builder()
                        .id(div.getId())
                        .name(div.getName())
                        .description(div.getDescription())
                        .build())
                .collect(Collectors.toList());
    }
}

