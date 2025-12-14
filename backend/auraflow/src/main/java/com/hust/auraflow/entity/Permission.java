package com.hust.auraflow.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "permissions")
public class Permission {
    @Id
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "code", length = Integer.MAX_VALUE)
    private String code;

    @Column(name = "description", length = Integer.MAX_VALUE)
    private String description;

}