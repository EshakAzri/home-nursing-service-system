package com.example.homenursing.seeder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.homenursing.entity.Branch;
import com.example.homenursing.repository.BranchRepository;

@Component
public class BranchSeeder implements CommandLineRunner {

    @Autowired
    private BranchRepository branchRepository;

    @Override
    public void run(String... args) throws Exception {
        if (branchRepository.count() == 0) {
            // Create Malaysian branches
            Branch kualaLumpurBranch = Branch.builder()
                .name("Kuala Lumpur Central Clinic")
                .address("Jalan Bukit Bintang, Golden Triangle")
                .city("Kuala Lumpur")
                .state("Federal Territory")
                .zipCode("55100")
                .phoneNumber("+60-3-2141-2345")
                .email("klcentral@homecare.my")
                .managerName("Dr. Ahmad bin Abdullah")
                .isActive(true)
                .build();

            Branch penangBranch = Branch.builder()
                .name("Penang Healthcare Hub")
                .address("Jalan Burma, Georgetown")
                .city("George Town")
                .state("Penang")
                .zipCode("10350")
                .phoneNumber("+60-4-261-3456")
                .email("penang@homecare.my")
                .managerName("Dr. Lim Wei Ming")
                .isActive(true)
                .build();

            Branch johorBahruBranch = Branch.builder()
                .name("Johor Bahru Medical Center")
                .address("Jalan Tun Abdul Razak, Johor Bahru City Centre")
                .city("Johor Bahru")
                .state("Johor")
                .zipCode("80000")
                .phoneNumber("+60-7-223-4567")
                .email("johorbahru@homecare.my")
                .managerName("Dr. Siti Nurhaliza")
                .isActive(true)
                .build();

            Branch kuchingBranch = Branch.builder()
                .name("Kuching Wellness Center")
                .address("Jalan Satok, Kuching City Centre")
                .city("Kuching")
                .state("Sarawak")
                .zipCode("93000")
                .phoneNumber("+60-82-234-5678")
                .email("kuching@homecare.my")
                .managerName("Dr. Wong Chen Wei")
                .isActive(true)
                .build();

            Branch kotaKinabaluBranch = Branch.builder()
                .name("Kota Kinabalu Health Services")
                .address("Jalan Tun Fuad Stephens, Karamunsing")
                .city("Kota Kinabalu")
                .state("Sabah")
                .zipCode("88000")
                .phoneNumber("+60-88-234-6789")
                .email("kk@homecare.my")
                .managerName("Dr. Maria Lourdes")
                .isActive(true)
                .build();

            Branch ipohBranch = Branch.builder()
                .name("Ipoh Nursing Care Center")
                .address("Jalan Sultan Idris Shah, Ipoh Garden")
                .city("Ipoh")
                .state("Perak")
                .zipCode("30000")
                .phoneNumber("+60-5-254-7890")
                .email("ipoh@homecare.my")
                .managerName("Dr. Rajesh Kumar")
                .isActive(true)
                .build();

            branchRepository.save(kualaLumpurBranch);
            branchRepository.save(penangBranch);
            branchRepository.save(johorBahruBranch);
            branchRepository.save(kuchingBranch);
            branchRepository.save(kotaKinabaluBranch);
            branchRepository.save(ipohBranch);

            System.out.println("Malaysian branches seeded successfully!");
        }
    }
}