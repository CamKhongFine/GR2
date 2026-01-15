package com.hust.auraflow.repository;

import com.hust.auraflow.entity.StepTaskData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StepTaskDataRepository extends JpaRepository<StepTaskData, Long> {
    
    List<StepTaskData> findByStepTaskIdOrderByCreatedAtDesc(Long stepTaskId);
}
