package com.example.homenursing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.homenursing.entity.Patient;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    // Custom queries can be added here if needed
}