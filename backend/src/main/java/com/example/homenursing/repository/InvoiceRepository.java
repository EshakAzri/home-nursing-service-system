package com.example.homenursing.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.homenursing.entity.Invoice;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    
    Optional<Invoice> findByBookingId(Long bookingId);
    
    @Query("SELECT i FROM Invoice i WHERE i.booking.user.id = :userId ORDER BY i.issuedDate DESC")
    List<Invoice> findAllByUserId(@Param("userId") Long userId);
}
