package com.example.homenursing.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.homenursing.entity.Booking;
import com.example.homenursing.entity.User;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    // Find all bookings for a specific user
    List<Booking> findByUserOrderByBookingDateTimeDesc(User user);
}