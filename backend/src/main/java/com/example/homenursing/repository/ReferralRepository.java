package com.example.homenursing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.homenursing.entity.Referral;

@Repository
public interface ReferralRepository extends JpaRepository<Referral, Long> {
    // Custom queries can be added here if needed
}