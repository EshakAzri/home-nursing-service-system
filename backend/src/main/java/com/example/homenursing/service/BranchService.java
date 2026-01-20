package com.example.homenursing.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.homenursing.entity.Booking;
import com.example.homenursing.entity.Branch;
import com.example.homenursing.entity.Nurse;
import com.example.homenursing.repository.BookingRepository;
import com.example.homenursing.repository.BranchRepository;
import com.example.homenursing.repository.NurseRepository;

@Service
public class BranchService {

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private NurseRepository nurseRepository;

    @Autowired
    private BookingRepository bookingRepository;

    // Create
    public Branch createBranch(Branch branch) {
        return branchRepository.save(branch);
    }

    // Read all
    public List<Branch> getAllBranches() {
        return branchRepository.findAll();
    }

    // Read by ID
    public Optional<Branch> getBranchById(Long id) {
        return branchRepository.findById(id);
    }

    // Update
    public Branch updateBranch(Long id, Branch branchDetails) {
        Optional<Branch> optionalBranch = branchRepository.findById(id);
        if (optionalBranch.isPresent()) {
            Branch branch = optionalBranch.get();
            branch.setName(branchDetails.getName());
            branch.setAddress(branchDetails.getAddress());
            branch.setCity(branchDetails.getCity());
            branch.setState(branchDetails.getState());
            branch.setZipCode(branchDetails.getZipCode());
            branch.setPhoneNumber(branchDetails.getPhoneNumber());
            branch.setEmail(branchDetails.getEmail());
            branch.setManagerName(branchDetails.getManagerName());
            branch.setIsActive(branchDetails.getIsActive());
            return branchRepository.save(branch);
        } else {
            throw new RuntimeException("Branch not found with id " + id);
        }
    }

    // Delete
    public void deleteBranch(Long id) {
        branchRepository.deleteById(id);
    }

    // Performance Reports

    // Total number of bookings for the branch
    public long getTotalBookingsForBranch(Long branchId) {
        List<Nurse> nurses = nurseRepository.findAll().stream()
            .filter(nurse -> nurse.getBranch().getId().equals(branchId))
            .toList();
        return bookingRepository.findAll().stream()
            .filter(booking -> nurses.contains(booking.getNurse()))
            .count();
    }

    // Total revenue from completed bookings for the branch
    public Double getTotalRevenueForBranch(Long branchId) {
        List<Nurse> nurses = nurseRepository.findAll().stream()
            .filter(nurse -> nurse.getBranch().getId().equals(branchId))
            .toList();
        return bookingRepository.findAll().stream()
            .filter(booking -> nurses.contains(booking.getNurse()))
            .filter(booking -> booking.getStatus() == Booking.BookingStatus.COMPLETED)
            .mapToDouble(booking -> booking.getFinalCost() != null ? booking.getFinalCost() : 0.0)
            .sum();
    }

    // Number of active nurses in the branch
    public long getActiveNursesCount(Long branchId) {
        return nurseRepository.findAll().stream()
            .filter(nurse -> nurse.getBranch().getId().equals(branchId))
            .filter(Nurse::getIsAvailable)
            .count();
    }

    // Average booking cost for the branch
    public Double getAverageBookingCost(Long branchId) {
        List<Nurse> nurses = nurseRepository.findAll().stream()
            .filter(nurse -> nurse.getBranch().getId().equals(branchId))
            .toList();
        List<Double> costs = bookingRepository.findAll().stream()
            .filter(booking -> nurses.contains(booking.getNurse()))
            .filter(booking -> booking.getStatus() == Booking.BookingStatus.COMPLETED)
            .map(booking -> booking.getFinalCost() != null ? booking.getFinalCost() : 0.0)
            .toList();
        if (costs.isEmpty()) return 0.0;
        return costs.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }
}