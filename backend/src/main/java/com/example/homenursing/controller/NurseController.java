package com.example.homenursing.controller;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.homenursing.dto.NurseEarningsDTO;
import com.example.homenursing.entity.Nurse;
import com.example.homenursing.service.NurseService;

@RestController
@RequestMapping("/api/nurses")
@CrossOrigin(origins = "http://localhost:5173")
public class NurseController {

    private static final Logger logger = LoggerFactory.getLogger(NurseController.class);

    @Autowired
    private NurseService nurseService;

    // GET /api/nurses - Get all nurses
    @GetMapping
    public ResponseEntity<List<Nurse>> getAllNurses() {
        List<Nurse> nurses = nurseService.getAllNurses();
        logger.info("Fetching all nurses, count: {}", nurses.size());
        if (nurses.isEmpty()) {
            logger.warn("No nurses found in the database");
        }
        return ResponseEntity.ok(nurses);
    }

    // GET /api/nurses/{id} - Get nurse by ID
    @GetMapping("/{id}")
    public ResponseEntity<Nurse> getNurseById(@PathVariable Long id) {
        Optional<Nurse> nurse = nurseService.getNurseById(id);
        if (nurse.isPresent()) {
            return ResponseEntity.ok(nurse.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /api/nurses/email/{email} - Get nurses by email (must be before /{id})
    @GetMapping("/email/{email}")
    public ResponseEntity<List<Nurse>> getNurseByEmail(@PathVariable String email) {
        try {
            List<Nurse> nurses = nurseService.getNurseByEmail(email);
            return ResponseEntity.ok(nurses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // POST /api/nurses - Create a new nurse
    @PostMapping
    public ResponseEntity<Nurse> createNurse(@RequestBody Nurse nurse) {
        try {
            Nurse createdNurse = nurseService.createNurse(nurse);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdNurse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // PUT /api/nurses/{id} - Update an existing nurse
    @PutMapping("/{id}")
    public ResponseEntity<Nurse> updateNurse(@PathVariable Long id, @RequestBody Nurse nurseDetails) {
        try {
            Nurse updatedNurse = nurseService.updateNurse(id, nurseDetails);
            return ResponseEntity.ok(updatedNurse);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // DELETE /api/nurses/{id} - Delete a nurse
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNurse(@PathVariable Long id) {
        try {
            nurseService.deleteNurse(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /api/nurses/{id}/commission - Get commission for a nurse
    @GetMapping("/{id}/commission")
    public ResponseEntity<Double> getNurseCommission(@PathVariable Long id) {
        try {
            Double commission = nurseService.calculateCommission(id);
            return ResponseEntity.ok(commission);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // GET /api/nurses/available - Get nurses by service type and branch using service configurations
    @GetMapping("/available")
    public ResponseEntity<List<Nurse>> getNursesByServiceTypeAndBranch(
            @RequestParam Long serviceTypeId,
            @RequestParam Long branchId) {
        try {
            List<Nurse> nurses = nurseService.getNursesByServiceTypeAndBranch(serviceTypeId, branchId);
            return ResponseEntity.ok(nurses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // GET /api/nurses/earnings/all - Get all nurses earnings for a specific month
    @GetMapping("/earnings/all")
    public ResponseEntity<List<NurseEarningsDTO>> getAllNursesEarnings(
            @RequestParam(required = false) String month) {
        try {
            if (month == null || month.isEmpty()) {
                // Default to current month if not provided
                java.time.YearMonth currentMonth = java.time.YearMonth.now();
                month = currentMonth.toString();
            }
            List<NurseEarningsDTO> earnings = nurseService.getAllNursesEarnings(month);
            return ResponseEntity.ok(earnings);
        } catch (Exception e) {
            logger.error("Error fetching all earnings: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // GET /api/nurses/{id}/earnings - Get earnings for a specific nurse in a specific month
    @GetMapping("/{id}/earnings")
    public ResponseEntity<NurseEarningsDTO> getNurseEarnings(
            @PathVariable Long id,
            @RequestParam(required = false) String month) {
        try {
            if (month == null || month.isEmpty()) {
                // Default to current month if not provided
                java.time.YearMonth currentMonth = java.time.YearMonth.now();
                month = currentMonth.toString();
            }
            NurseEarningsDTO earnings = nurseService.getNurseEarnings(id, month);
            return ResponseEntity.ok(earnings);
        } catch (Exception e) {
            logger.error("Error fetching nurse earnings: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // GET /api/nurses/{id}/earnings/all-time - Get all time earnings for a specific nurse
    @GetMapping("/{id}/earnings/all-time")
    public ResponseEntity<NurseEarningsDTO> getNurseAllTimeEarnings(@PathVariable Long id) {
        try {
            NurseEarningsDTO earnings = nurseService.getNurseAllTimeEarnings(id);
            return ResponseEntity.ok(earnings);
        } catch (Exception e) {
            logger.error("Error fetching all time earnings: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}