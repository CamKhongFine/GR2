package com.hust.auraflow.repository;

import com.hust.auraflow.entity.InviteRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InviteRequestRepository extends JpaRepository<InviteRequest, Long> {
}

