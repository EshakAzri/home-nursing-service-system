package com.example.homenursing.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.homenursing.entity.Referral;
import com.example.homenursing.repository.ReferralRepository;

@Service
public class ReferralService {

    @Autowired
    private ReferralRepository referralRepository;

    // Create referral
    public Referral createReferral(Referral referral) {
        return referralRepository.save(referral);
    }

    // Read all referrals
    public List<Referral> getAllReferrals() {
        return referralRepository.findAll();
    }

    // Read by ID
    public Optional<Referral> getReferralById(Long id) {
        return referralRepository.findById(id);
    }

    // Update referral
    public Referral updateReferral(Long id, Referral referralDetails) {
        Optional<Referral> optionalReferral = referralRepository.findById(id);
        if (optionalReferral.isPresent()) {
            Referral referral = optionalReferral.get();
            referral.setPatient(referralDetails.getPatient());
            referral.setReferrerName(referralDetails.getReferrerName());
            referral.setReferrerContact(referralDetails.getReferrerContact());
            referral.setReferrerSpecialty(referralDetails.getReferrerSpecialty());
            referral.setReferralDate(referralDetails.getReferralDate());
            referral.setReferralReason(referralDetails.getReferralReason());
            referral.setStatus(referralDetails.getStatus());
            referral.setNotes(referralDetails.getNotes());
            return referralRepository.save(referral);
        } else {
            throw new RuntimeException("Referral not found with id " + id);
        }
    }

    // Delete referral
    public void deleteReferral(Long id) {
        referralRepository.deleteById(id);
    }

    // Reward logic: Calculate reward for completed referrals
    // Assuming a fixed reward of RM30 per completed referral
    public Double calculateRewardForReferrer(String referrerName) {
        List<Referral> completedReferrals = referralRepository.findAll().stream()
            .filter(referral -> referral.getReferrerName().equals(referrerName))
            .filter(referral -> referral.getStatus() == Referral.ReferralStatus.COMPLETED)
            .toList();
        return completedReferrals.size() * 30.0; // RM30 per completed referral
    }
}