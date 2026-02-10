package com.example.homenursing.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.homenursing.entity.Booking;
import com.example.homenursing.entity.Nurse;
import com.example.homenursing.entity.User;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    // Find all bookings for a specific user
    List<Booking> findByUserOrderByBookingDateTimeDesc(User user);
    
    // Find all bookings for a specific nurse
    List<Booking> findByNurseOrderByBookingDateTimeDesc(Nurse nurse);
    
    // Find all bookings with nurse and branch data loaded
    @Query("SELECT b FROM Booking b JOIN FETCH b.nurse n JOIN FETCH n.branch")
    List<Booking> findAllWithNurseAndBranch();
    
    // Find completed bookings for a nurse within a date range
    @Query("SELECT b FROM Booking b WHERE b.nurse.id = :nurseId AND b.status = 'COMPLETED' AND b.bookingDateTime BETWEEN :startDate AND :endDate")
    List<Booking> findCompletedBookingsByNurseAndDateRange(
        @Param("nurseId") Long nurseId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    // Find all completed bookings for a nurse
    @Query("SELECT b FROM Booking b WHERE b.nurse.id = :nurseId AND b.status = 'COMPLETED'")
    List<Booking> findAllCompletedBookingsByNurse(@Param("nurseId") Long nurseId);
}