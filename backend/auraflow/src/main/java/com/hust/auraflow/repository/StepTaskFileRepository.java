package com.hust.auraflow.repository;

import com.hust.auraflow.entity.StepTaskFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StepTaskFileRepository extends JpaRepository<StepTaskFile, Long> {

    List<StepTaskFile> findByStepTaskIdOrderByCreatedAtDesc(Long stepTaskId);

    /**
     * Delete all step task files for step tasks belonging to a given task.
     */
    @Modifying
    @Query("DELETE FROM StepTaskFile stf WHERE stf.stepTask.task.id = :taskId")
    void deleteByTaskId(@Param("taskId") Long taskId);
}
