package com.example.homenursing.service;

import com.example.homenursing.entity.Booking;
import com.example.homenursing.entity.Booking.BookingStatus;
import com.example.homenursing.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
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

    // Additional query methods can be added here as needed
    // For example: findByPatientId, findByNurseId, findByStatus, findByDateRange, etc.
}