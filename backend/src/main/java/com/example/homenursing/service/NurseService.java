package com.example.homenursing.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.homenursing.entity.Booking;
import com.example.homenursing.entity.Nurse;
import com.example.homenursing.repository.BookingRepository;
import com.example.homenursing.repository.NurseRepository;

@Service
public class NurseService {

    @Autowired
    private NurseRepository nurseRepository;

    @Autowired
    private BookingRepository bookingRepository;

    // Create
    public Nurse createNurse(Nurse nurse) {
        return nurseRepository.save(nurse);
    }

    // Read all
    public List<Nurse> getAllNurses() {
        return nurseRepository.findAll();
    }

    // Read by ID
    public Optional<Nurse> getNurseById(Long id) {
        return nurseRepository.findById(id);
    }

    // Update
    public Nurse updateNurse(Long id, Nurse nurseDetails) {
        Optional<Nurse> optionalNurse = nurseRepository.findById(id);
        if (optionalNurse.isPresent()) {
            Nurse nurse = optionalNurse.get();
            nurse.setFirstName(nurseDetails.getFirstName());
            nurse.setLastName(nurseDetails.getLastName());
            nurse.setEmail(nurseDetails.getEmail());
            nurse.setPhoneNumber(nurseDetails.getPhoneNumber());
            nurse.setLicenseNumber(nurseDetails.getLicenseNumber());
            nurse.setLicenseExpiryDate(nurseDetails.getLicenseExpiryDate());
            nurse.setSpecialization(nurseDetails.getSpecialization());
            nurse.setYearsOfExperience(nurseDetails.getYearsOfExperience());
            nurse.setBio(nurseDetails.getBio());
            nurse.setHourlyRate(nurseDetails.getHourlyRate());
            nurse.setIsAvailable(nurseDetails.getIsAvailable());
            nurse.setDateOfBirth(nurseDetails.getDateOfBirth());
            nurse.setBranch(nurseDetails.getBranch());
            return nurseRepository.save(nurse);
        } else {
            throw new RuntimeException("Nurse not found with id " + id);
        }
    }

    // Delete
    public void deleteNurse(Long id) {
        nurseRepository.deleteById(id);
    }

    // Commission calculation
    public Double calculateCommission(Long nurseId) {
        List<Booking> completedBookings = bookingRepository.findAll().stream()
            .filter(booking -> booking.getNurse().getId().equals(nurseId))
            .filter(booking -> booking.getStatus() == Booking.BookingStatus.COMPLETED)
            .toList();
        
        Double totalEarnings = completedBookings.stream()
            .mapToDouble(booking -> booking.getFinalCost() != null ? booking.getFinalCost() : 0.0)
            .sum();
        
        // Assuming 10% commission
        return totalEarnings * 0.10;
    }
}