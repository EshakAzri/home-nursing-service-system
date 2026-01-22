package com.example.homenursing.config;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.homenursing.entity.ServiceType;
import com.example.homenursing.repository.ServiceTypeRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private ServiceTypeRepository serviceTypeRepository;

    @Override
    public void run(String... args) throws Exception {
        if (serviceTypeRepository.count() == 0) {
            // Add initial service types
            ServiceType generalCheckup = ServiceType.builder()
                .name("General Checkup")
                .description("Routine health assessment and vital signs monitoring")
                .basePricePerHour(BigDecimal.valueOf(50.00))
                .estimatedDurationHours(1.0)
                .active(true)
                .build();

            ServiceType woundCare = ServiceType.builder()
                .name("Wound Care")
                .description("Professional wound dressing and care services")
                .basePricePerHour(BigDecimal.valueOf(75.00))
                .estimatedDurationHours(1.5)
                .active(true)
                .build();

            ServiceType medicationManagement = ServiceType.builder()
                .name("Medication Management")
                .description("Assistance with medication administration and monitoring")
                .basePricePerHour(BigDecimal.valueOf(60.00))
                .estimatedDurationHours(0.5)
                .active(true)
                .build();

            ServiceType physicalTherapy = ServiceType.builder()
                .name("Physical Therapy")
                .description("Rehabilitation exercises and mobility assistance")
                .basePricePerHour(BigDecimal.valueOf(80.00))
                .estimatedDurationHours(2.0)
                .active(true)
                .build();

            ServiceType diabetesCare = ServiceType.builder()
                .name("Diabetes Care")
                .description("Blood sugar monitoring and diabetes management")
                .basePricePerHour(BigDecimal.valueOf(55.00))
                .estimatedDurationHours(1.0)
                .active(true)
                .build();

            serviceTypeRepository.save(generalCheckup);
            serviceTypeRepository.save(woundCare);
            serviceTypeRepository.save(medicationManagement);
            serviceTypeRepository.save(physicalTherapy);
            serviceTypeRepository.save(diabetesCare);

            System.out.println("Initial service types seeded successfully!");
        }
    }
}