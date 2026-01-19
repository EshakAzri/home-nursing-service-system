package com.example.homenursing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.homenursing.entity.Branch;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    // Custom queries can be added here if needed
}