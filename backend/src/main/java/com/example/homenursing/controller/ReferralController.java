package com.example.homenursing.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.homenursing.entity.Referral;
import com.example.homenursing.service.ReferralService;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api/referrals")
@CrossOrigin(origins = "http://localhost:5173")
public class ReferralController {

    @Autowired
    private ReferralService referralService;

    // GET /api/referrals - Get all referrals
    @GetMapping
    public ResponseEntity<List<Referral>> getAllReferrals() {
        List<Referral> referrals = referralService.getAllReferrals();
        return ResponseEntity.ok(referrals);
    }

    // GET /api/referrals/{id} - Get referral by ID
    @GetMapping("/{id}")
    public ResponseEntity<Referral> getReferralById(@PathVariable Long id) {
        Optional<Referral> referral = referralService.getReferralById(id);
        if (referral.isPresent()) {
            return ResponseEntity.ok(referral.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // POST /api/referrals - Create a new referral
    @PostMapping
    public ResponseEntity<Referral> createReferral(@RequestBody Referral referral) {
        try {
            Referral createdReferral = referralService.createReferral(referral);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdReferral);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // PUT /api/referrals/{id} - Update an existing referral
    @PutMapping("/{id}")
    public ResponseEntity<Referral> updateReferral(@PathVariable Long id, @RequestBody Referral referralDetails) {
        try {
            Referral updatedReferral = referralService.updateReferral(id, referralDetails);
            return ResponseEntity.ok(updatedReferral);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // DELETE /api/referrals/{id} - Delete a referral
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReferral(@PathVariable Long id) {
        try {
            referralService.deleteReferral(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /api/referrals/reward/{referrerName} - Get reward for referrer
    @GetMapping("/reward/{referrerName}")
    public ResponseEntity<Double> getRewardForReferrer(@PathVariable String referrerName) {
        try {
            Double reward = referralService.calculateRewardForReferrer(referrerName);
            return ResponseEntity.ok(reward);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}