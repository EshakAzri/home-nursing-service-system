package com.example.homenursing.service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.homenursing.dto.NurseEarningsDTO;
import com.example.homenursing.entity.Booking;
import com.example.homenursing.entity.Nurse;
import com.example.homenursing.entity.User;
import com.example.homenursing.repository.BookingRepository;
import com.example.homenursing.repository.NurseRepository;
import com.example.homenursing.repository.UserRepository;

@Service
public class NurseService {

    @Autowired
    private NurseRepository nurseRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ServiceConfigurationService serviceConfigurationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    // Create
    public Nurse createNurse(Nurse nurse) {
        // Check if user with this email already exists
        if (userRepository.findByUsername(nurse.getEmail()).isPresent()) {
            throw new RuntimeException("A user with this email already exists");
        }

        // Create User account for the nurse
        User user = User.builder()
            .username(nurse.getEmail()) // Use email as username
            .password(userService.encodePassword("defaultpassword")) // Default password
            .email(nurse.getEmail())
            .role(User.Role.NURSE)
            .build();
        userRepository.save(user);

        // Save the nurse
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

    // Get nurses by service type and branch using service configurations
    public List<Nurse> getNursesByServiceTypeAndBranch(Long serviceTypeId, Long branchId) {
        return serviceConfigurationService.getNursesByServiceTypeAndBranch(serviceTypeId, branchId);
    }

    // Get nurse by email
    public List<Nurse> getNurseByEmail(String email) {
        return nurseRepository.findByEmail(email);
    }

    // Calculate earnings for a specific nurse in a specific month
    public NurseEarningsDTO getNurseEarnings(Long nurseId, String month) {
        Optional<Nurse> optionalNurse = nurseRepository.findById(nurseId);
        if (!optionalNurse.isPresent()) {
            throw new RuntimeException("Nurse not found");
        }

        Nurse nurse = optionalNurse.get();
        YearMonth yearMonth = YearMonth.parse(month);
        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        List<Booking> completedBookings = bookingRepository
            .findCompletedBookingsByNurseAndDateRange(nurseId, startDate, endDate);

        double totalEarnings = completedBookings.stream()
            .mapToDouble(booking -> booking.getFinalCost() != null ? booking.getFinalCost() : 0.0)
            .sum();

        double commission = totalEarnings * 0.10; // 10% commission

        return NurseEarningsDTO.builder()
            .nurseId(nurse.getId())
            .firstName(nurse.getFirstName())
            .lastName(nurse.getLastName())
            .email(nurse.getEmail())
            .specialization(nurse.getSpecialization())
            .hourlyRate(nurse.getHourlyRate())
            .completedBookings((long) completedBookings.size())
            .totalEarnings(totalEarnings)
            .commission(commission)
            .month(month)
            .build();
    }

    // Get all nurses earnings for a specific month
    public List<NurseEarningsDTO> getAllNursesEarnings(String month) {
        List<Nurse> allNurses = nurseRepository.findAll();
        List<NurseEarningsDTO> earningsList = new ArrayList<>();

        for (Nurse nurse : allNurses) {
            try {
                NurseEarningsDTO earnings = getNurseEarnings(nurse.getId(), month);
                earningsList.add(earnings);
            } catch (Exception e) {
                // Skip if there's an error for a specific nurse
                continue;
            }
        }

        return earningsList;
    }

    // Get all earnings for a specific nurse (all time)
    public NurseEarningsDTO getNurseAllTimeEarnings(Long nurseId) {
        Optional<Nurse> optionalNurse = nurseRepository.findById(nurseId);
        if (!optionalNurse.isPresent()) {
            throw new RuntimeException("Nurse not found");
        }

        Nurse nurse = optionalNurse.get();
        List<Booking> completedBookings = bookingRepository.findAllCompletedBookingsByNurse(nurseId);

        double totalEarnings = completedBookings.stream()
            .mapToDouble(booking -> booking.getFinalCost() != null ? booking.getFinalCost() : 0.0)
            .sum();

        double commission = totalEarnings * 0.10; // 10% commission

        return NurseEarningsDTO.builder()
            .nurseId(nurse.getId())
            .firstName(nurse.getFirstName())
            .lastName(nurse.getLastName())
            .email(nurse.getEmail())
            .specialization(nurse.getSpecialization())
            .hourlyRate(nurse.getHourlyRate())
            .completedBookings((long) completedBookings.size())
            .totalEarnings(totalEarnings)
            .commission(commission)
            .month("ALL")
            .build();
    }
}