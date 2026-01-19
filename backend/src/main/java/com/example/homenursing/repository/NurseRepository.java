package com.example.homenursing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.homenursing.entity.Nurse;

@Repository
public interface NurseRepository extends JpaRepository<Nurse, Long> {
    // Custom queries can be added here if needed
}