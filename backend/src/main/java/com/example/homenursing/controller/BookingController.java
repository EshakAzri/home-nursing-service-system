package com.example.homenursing.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.homenursing.entity.Booking;
import com.example.homenursing.entity.Booking.BookingStatus;
import com.example.homenursing.entity.Nurse;
import com.example.homenursing.entity.ServiceType;
import com.example.homenursing.entity.User;
import com.example.homenursing.service.BookingService;
import com.example.homenursing.service.NurseService;
import com.example.homenursing.service.ServiceTypeService;
import com.example.homenursing.service.UserService;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserService userService;

    @Autowired
    private NurseService nurseService;

    @Autowired
    private ServiceTypeService serviceTypeService;

    // GET /api/bookings - Get all bookings
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    // GET /api/bookings/{id} - Get booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        Optional<Booking> booking = bookingService.getBookingById(id);
        if (booking.isPresent()) {
            return ResponseEntity.ok(booking.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // POST /api/bookings - Create a new booking
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> bookingData) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userService.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

            // Parse the booking data
            Long nurseId = Long.valueOf(bookingData.get("nurse").toString().split(":")[1].replace("}", "").trim());
            Long serviceTypeId = Long.valueOf(bookingData.get("serviceType").toString());
            LocalDate bookingDate = LocalDate.parse(bookingData.get("bookingDate").toString());
            LocalTime bookingTime = LocalTime.parse(bookingData.get("bookingTime").toString());
            Double duration = Double.valueOf(bookingData.get("duration").toString());
            Double estimatedCost = Double.valueOf(bookingData.get("estimatedCost").toString());
            String notes = (String) bookingData.get("notes");

            Nurse nurse = nurseService.getNurseById(nurseId).orElseThrow(() -> new RuntimeException("Nurse not found"));
            ServiceType serviceType = serviceTypeService.getServiceTypeById(serviceTypeId).orElseThrow(() -> new RuntimeException("Service type not found"));

            // Calculate bookingDateTime
            LocalDateTime bookingDateTime = LocalDateTime.of(bookingDate, bookingTime);

            // Calculate estimated cost based on service type and duration
            Double calculatedCost = serviceType.getBasePricePerHour().doubleValue() * duration;

            Booking booking = Booking.builder()
                .user(currentUser)
                .nurse(nurse)
                .bookingDateTime(bookingDateTime)
                .serviceType(serviceType)
                .duration(duration)
                .estimatedCost(calculatedCost)
                .notes(notes)
                .status(BookingStatus.PENDING)
                .build();

            Booking createdBooking = bookingService.createBooking(booking);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/bookings/{id} - Update an existing booking
    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(@PathVariable Long id, @RequestBody Booking bookingDetails) {
        try {
            Booking updatedBooking = bookingService.updateBooking(id, bookingDetails);
            return ResponseEntity.ok(updatedBooking);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // DELETE /api/bookings/{id} - Delete a booking
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        try {
            bookingService.deleteBooking(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}