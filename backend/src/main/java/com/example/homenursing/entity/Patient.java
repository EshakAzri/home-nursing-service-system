package com.example.homenursing.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String phoneNumber;
    
    @Column(nullable = false)
    private LocalDate dateOfBirth;
    
    @Column(length = 500)
    private String address;
    
    @Column(nullable = false, unique = true)
    private String medicalRecordNumber;
    
    @Column
    private String emergencyContactName;
    
    @Column
    private String emergencyContactPhone;
    
    @Column(length = 500)
    private String medicalHistory;
    
    @Column(nullable = false)
    private String insuranceProvider;
    
    @Column(nullable = false)
    private String insurancePolicyNumber;
}