package com.hust.auraflow.repository;

import com.hust.auraflow.entity.StepTaskData;
import com.hust.auraflow.entity.StepTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StepTaskDataRepository extends JpaRepository<StepTaskData, Long> {

    List<StepTaskData> findByStepTaskIdOrderByCreatedAtDesc(Long stepTaskId);

    /**
     * Delete all step task data for step tasks belonging to a given task.
     */
    @Modifying
    @Query("DELETE FROM StepTaskData std WHERE std.stepTask.task.id = :taskId")
    void deleteByTaskId(@Param("taskId") Long taskId);
}
