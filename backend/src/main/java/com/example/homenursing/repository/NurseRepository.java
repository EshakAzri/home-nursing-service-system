package com.example.homenursing.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.homenursing.entity.Nurse;

@Repository
public interface NurseRepository extends JpaRepository<Nurse, Long> {
    // Find nurses by email
    List<Nurse> findByEmail(String email);
}