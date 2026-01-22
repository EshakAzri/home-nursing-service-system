package com.example.homenursing.config;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.homenursing.entity.Branch;
import com.example.homenursing.entity.Nurse;
import com.example.homenursing.entity.ServiceConfiguration;
import com.example.homenursing.entity.ServiceType;
import com.example.homenursing.repository.BranchRepository;
import com.example.homenursing.repository.NurseRepository;
import com.example.homenursing.repository.ServiceConfigurationRepository;
import com.example.homenursing.repository.ServiceTypeRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private ServiceTypeRepository serviceTypeRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private NurseRepository nurseRepository;

    @Autowired
    private ServiceConfigurationRepository serviceConfigurationRepository;

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

        // Seed service configurations if none exist
        if (serviceConfigurationRepository.count() == 0) {
            // Get existing data
            java.util.List<Branch> branches = branchRepository.findAll();
            java.util.List<Nurse> nurses = nurseRepository.findAll();
            java.util.List<ServiceType> serviceTypes = serviceTypeRepository.findAll();

            if (!branches.isEmpty() && !nurses.isEmpty() && !serviceTypes.isEmpty()) {
                // Create service configurations
                // Assuming we have at least one branch, some nurses, and service types

                // Nurse 1 can do General Checkup and Medication Management
                if (nurses.size() > 0) {
                    ServiceConfiguration config1 = ServiceConfiguration.builder()
                        .nurse(nurses.get(0))
                        .serviceType(serviceTypes.stream().filter(st -> st.getName().equals("General Checkup")).findFirst().orElse(null))
                        .isActive(true)
                        .build();

                    ServiceConfiguration config2 = ServiceConfiguration.builder()
                        .nurse(nurses.get(0))
                        .serviceType(serviceTypes.stream().filter(st -> st.getName().equals("Medication Management")).findFirst().orElse(null))
                        .isActive(true)
                        .build();

                    if (config1.getServiceType() != null) serviceConfigurationRepository.save(config1);
                    if (config2.getServiceType() != null) serviceConfigurationRepository.save(config2);
                }

                // Nurse 2 can do Wound Care and Physical Therapy
                if (nurses.size() > 1) {
                    ServiceConfiguration config3 = ServiceConfiguration.builder()
                        .nurse(nurses.get(1))
                        .serviceType(serviceTypes.stream().filter(st -> st.getName().equals("Wound Care")).findFirst().orElse(null))
                        .isActive(true)
                        .build();

                    ServiceConfiguration config4 = ServiceConfiguration.builder()
                        .nurse(nurses.get(1))
                        .serviceType(serviceTypes.stream().filter(st -> st.getName().equals("Physical Therapy")).findFirst().orElse(null))
                        .isActive(true)
                        .build();

                    if (config3.getServiceType() != null) serviceConfigurationRepository.save(config3);
                    if (config4.getServiceType() != null) serviceConfigurationRepository.save(config4);
                }

                // Nurse 3 can do Diabetes Care and General Checkup
                if (nurses.size() > 2) {
                    ServiceConfiguration config5 = ServiceConfiguration.builder()
                        .nurse(nurses.get(2))
                        .serviceType(serviceTypes.stream().filter(st -> st.getName().equals("Diabetes Care")).findFirst().orElse(null))
                        .isActive(true)
                        .build();

                    ServiceConfiguration config6 = ServiceConfiguration.builder()
                        .nurse(nurses.get(2))
                        .serviceType(serviceTypes.stream().filter(st -> st.getName().equals("General Checkup")).findFirst().orElse(null))
                        .isActive(true)
                        .build();

                    if (config5.getServiceType() != null) serviceConfigurationRepository.save(config5);
                    if (config6.getServiceType() != null) serviceConfigurationRepository.save(config6);
                }

                System.out.println("Initial service configurations seeded successfully!");
            }
        }
    }
}