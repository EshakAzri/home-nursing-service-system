package com.example.homenursing.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.homenursing.entity.Booking;
import com.example.homenursing.entity.Booking.BookingStatus;
import com.example.homenursing.entity.Nurse;
import com.example.homenursing.entity.User;
import com.example.homenursing.repository.BookingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllWithNurseAndBranch();
    }

    public List<Booking> getAllBookings(String fromDate, String toDate) {
        List<Booking> bookings = bookingRepository.findAllWithNurseAndBranch();
        
        // Apply date filtering if dates are provided
        if ((fromDate != null && !fromDate.isEmpty()) || (toDate != null && !toDate.isEmpty())) {
            LocalDateTime startDate = null;
            LocalDateTime endDate = null;
            
            if (fromDate != null && !fromDate.isEmpty()) {
                startDate = LocalDate.parse(fromDate).atStartOfDay();
            }
            
            if (toDate != null && !toDate.isEmpty()) {
                endDate = LocalDate.parse(toDate).atTime(23, 59, 59);
            }
            
            final LocalDateTime finalStartDate = startDate;
            final LocalDateTime finalEndDate = endDate;
            
            bookings = bookings.stream()
                .filter(booking -> {
                    boolean afterStart = finalStartDate == null || 
                        booking.getBookingDateTime().isAfter(finalStartDate.minusSeconds(1));
                    boolean beforeEnd = finalEndDate == null || 
                        booking.getBookingDateTime().isBefore(finalEndDate.plusSeconds(1));
                    return afterStart && beforeEnd;
                })
                .collect(java.util.stream.Collectors.toList());
        }
        
        return bookings;
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    public Booking createBooking(Booking booking) {
        // Set default status if not provided
        if (booking.getStatus() == null) {
            booking.setStatus(BookingStatus.PENDING);
        }

        // Validate booking times
        validateBookingTimes(booking);

        return bookingRepository.save(booking);
    }

    public Booking updateBooking(Long id, Booking bookingDetails) {
        Optional<Booking> existingBookingOpt = bookingRepository.findById(id);
        if (existingBookingOpt.isPresent()) {
            Booking existingBooking = existingBookingOpt.get();

            // Update fields
            existingBooking.setBookingDateTime(bookingDetails.getBookingDateTime());
            existingBooking.setServiceType(bookingDetails.getServiceType());
            existingBooking.setDuration(bookingDetails.getDuration());
            existingBooking.setNotes(bookingDetails.getNotes());
            existingBooking.setEstimatedCost(bookingDetails.getEstimatedCost());
            existingBooking.setFinalCost(bookingDetails.getFinalCost());
            existingBooking.setStatus(bookingDetails.getStatus());

            // Validate updated times
            validateBookingTimes(existingBooking);

            return bookingRepository.save(existingBooking);
        }
        throw new RuntimeException("Booking not found with id: " + id);
    }

    public Booking updateBookingStatus(Long id, BookingStatus status) {
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            booking.setStatus(status);
            return bookingRepository.save(booking);
        }
        throw new RuntimeException("Booking not found with id: " + id);
    }

    public void cancelBooking(Long id) {
        updateBookingStatus(id, BookingStatus.CANCELLED);
    }

    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new RuntimeException("Booking not found with id: " + id);
        }
        bookingRepository.deleteById(id);
    }

    // Business logic validation methods
    private void validateBookingTimes(Booking booking) {
        // Basic validation - booking date/time should be in the future
        if (booking.getBookingDateTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Booking date/time must be in the future");
        }

        // Duration should be positive
        if (booking.getDuration() <= 0) {
            throw new IllegalArgumentException("Duration must be positive");
        }
    }

    // Get all bookings for a specific user
    public List<Booking> getUserBookings(User user) {
        return bookingRepository.findByUserOrderByBookingDateTimeDesc(user);
    }

    // Get all bookings/assignments for a specific nurse
    public List<Booking> getBookingsByNurse(Nurse nurse) {
        return bookingRepository.findByNurseOrderByBookingDateTimeDesc(nurse);
    }

    // Additional query methods can be added here as needed
    // For example: findByPatientId, findByNurseId, findByStatus, findByDateRange, etc.
}