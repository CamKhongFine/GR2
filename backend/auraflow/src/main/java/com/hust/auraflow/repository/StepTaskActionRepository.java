package com.hust.auraflow.repository;

import com.hust.auraflow.entity.StepTaskAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StepTaskActionRepository extends JpaRepository<StepTaskAction, Long> {
    
    /**
     * Find all actions for a given task, ordered by creation time (newest first).
     */
    @Query("SELECT sta FROM StepTaskAction sta WHERE sta.task.id = :taskId ORDER BY sta.createdAt DESC")
    List<StepTaskAction> findByTaskIdOrderByCreatedAtDesc(@Param("taskId") Long taskId);
}
