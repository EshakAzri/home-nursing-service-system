package com.example.homenursing.seeder;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.homenursing.entity.Branch;
import com.example.homenursing.entity.Nurse;
import com.example.homenursing.repository.BranchRepository;
import com.example.homenursing.repository.NurseRepository;

@Component
public class NurseSeeder implements CommandLineRunner {

    @Autowired
    private NurseRepository nurseRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Override
    public void run(String... args) throws Exception {
        if (nurseRepository.count() == 0) {
            // Get Malaysian branches (assuming BranchSeeder has run first)
            Branch kualaLumpurBranch = branchRepository.findById(1L).orElseThrow(() -> new RuntimeException("Kuala Lumpur branch not found"));
            Branch penangBranch = branchRepository.findById(2L).orElseThrow(() -> new RuntimeException("Penang branch not found"));
            Branch johorBahruBranch = branchRepository.findById(3L).orElseThrow(() -> new RuntimeException("Johor Bahru branch not found"));

            // Create sample nurses
            Nurse nurse1 = Nurse.builder()
                .firstName("Siti")
                .lastName("Abdullah")
                .email("siti.abdullah@homecare.my")
                .phoneNumber("+60-12-345-6789")
                .licenseNumber("RN-MY-2024-001")
                .licenseExpiryDate(LocalDate.of(2026, 12, 31))
                .specialization("General Nursing")
                .yearsOfExperience(8)
                .bio("Experienced registered nurse with 8 years in home healthcare. Specializes in geriatric care and chronic disease management.")
                .hourlyRate(45.0)
                .isAvailable(true)
                .dateOfBirth(LocalDate.of(1985, 5, 15))
                .branch(kualaLumpurBranch)
                .build();

            Nurse nurse2 = Nurse.builder()
                .firstName("Ahmad")
                .lastName("Razak")
                .email("ahmad.razak@homecare.my")
                .phoneNumber("+60-13-456-7890")
                .licenseNumber("RN-MY-2024-002")
                .licenseExpiryDate(LocalDate.of(2027, 6, 30))
                .specialization("Wound Care Specialist")
                .yearsOfExperience(12)
                .bio("Certified wound care specialist with 12 years of experience. Expert in advanced wound dressings and infection prevention.")
                .hourlyRate(55.0)
                .isAvailable(true)
                .dateOfBirth(LocalDate.of(1980, 3, 22))
                .branch(kualaLumpurBranch)
                .build();

            Nurse nurse3 = Nurse.builder()
                .firstName("Priya")
                .lastName("Devi")
                .email("priya.devi@homecare.my")
                .phoneNumber("+60-16-567-8901")
                .licenseNumber("RN-MY-2024-003")
                .licenseExpiryDate(LocalDate.of(2026, 8, 15))
                .specialization("Pediatric Nursing")
                .yearsOfExperience(6)
                .bio("Pediatric nurse with 6 years experience in home care. Specializes in child development and family-centered care.")
                .hourlyRate(40.0)
                .isAvailable(true)
                .dateOfBirth(LocalDate.of(1990, 11, 8))
                .branch(penangBranch)
                .build();

            Nurse nurse4 = Nurse.builder()
                .firstName("Wei")
                .lastName("Tan")
                .email("wei.tan@homecare.my")
                .phoneNumber("+60-17-678-9012")
                .licenseNumber("RN-MY-2024-004")
                .licenseExpiryDate(LocalDate.of(2027, 3, 20))
                .specialization("Mental Health Nursing")
                .yearsOfExperience(10)
                .bio("Mental health nurse with expertise in psychiatric care and counseling. 10 years experience in community mental health services.")
                .hourlyRate(50.0)
                .isAvailable(true)
                .dateOfBirth(LocalDate.of(1982, 7, 12))
                .branch(penangBranch)
                .build();

            Nurse nurse5 = Nurse.builder()
                .firstName("Fatimah")
                .lastName("Omar")
                .email("fatimah.omar@homecare.my")
                .phoneNumber("+60-18-789-0123")
                .licenseNumber("RN-MY-2024-005")
                .licenseExpiryDate(LocalDate.of(2026, 11, 10))
                .specialization("Diabetes Care Specialist")
                .yearsOfExperience(9)
                .bio("Certified diabetes educator and nurse. 9 years experience in diabetes management and patient education.")
                .hourlyRate(48.0)
                .isAvailable(true)
                .dateOfBirth(LocalDate.of(1984, 9, 5))
                .branch(johorBahruBranch)
                .build();

            nurseRepository.save(nurse1);
            nurseRepository.save(nurse2);
            nurseRepository.save(nurse3);
            nurseRepository.save(nurse4);
            nurseRepository.save(nurse5);

            System.out.println("Malaysian nurses seeded successfully!");
        }
    }
}