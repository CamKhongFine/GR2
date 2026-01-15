package com.hust.auraflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "step_task_files")
public class StepTaskFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Tenant tenant;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private StepTask stepTask;

    @NotNull
    private String fileName;

    @NotNull
    @Column(name = "object_name", length = Integer.MAX_VALUE)
    private String objectName;

    @Column(name = "file_size")
    private Long fileSize;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User uploadedBy;

    @NotNull
    @Column(updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}