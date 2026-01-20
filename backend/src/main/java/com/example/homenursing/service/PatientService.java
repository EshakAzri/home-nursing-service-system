package com.example.homenursing.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.homenursing.entity.Patient;
import com.example.homenursing.repository.PatientRepository;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    // Create
    public Patient createPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    // Read all
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    // Read by ID
    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    // Update
    public Patient updatePatient(Long id, Patient patientDetails) {
        Optional<Patient> optionalPatient = patientRepository.findById(id);
        if (optionalPatient.isPresent()) {
            Patient patient = optionalPatient.get();
            patient.setFirstName(patientDetails.getFirstName());
            patient.setLastName(patientDetails.getLastName());
            patient.setEmail(patientDetails.getEmail());
            patient.setPhoneNumber(patientDetails.getPhoneNumber());
            patient.setDateOfBirth(patientDetails.getDateOfBirth());
            patient.setAddress(patientDetails.getAddress());
            patient.setMedicalRecordNumber(patientDetails.getMedicalRecordNumber());
            patient.setEmergencyContactName(patientDetails.getEmergencyContactName());
            patient.setEmergencyContactPhone(patientDetails.getEmergencyContactPhone());
            patient.setMedicalHistory(patientDetails.getMedicalHistory());
            patient.setInsuranceProvider(patientDetails.getInsuranceProvider());
            patient.setInsurancePolicyNumber(patientDetails.getInsurancePolicyNumber());
            patient.setBranch(patientDetails.getBranch());
            return patientRepository.save(patient);
        } else {
            throw new RuntimeException("Patient not found with id " + id);
        }
    }

    // Delete
    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }
}