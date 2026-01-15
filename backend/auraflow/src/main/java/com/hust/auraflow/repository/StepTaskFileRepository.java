package com.hust.auraflow.repository;

import com.hust.auraflow.entity.StepTaskFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StepTaskFileRepository extends JpaRepository<StepTaskFile, Long> {
    
    List<StepTaskFile> findByStepTaskIdOrderByCreatedAtDesc(Long stepTaskId);
}
