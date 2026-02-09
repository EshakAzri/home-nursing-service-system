package com.example.homenursing.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.homenursing.entity.Booking;
import com.example.homenursing.entity.Invoice;
import com.example.homenursing.entity.User;
import com.example.homenursing.repository.BookingRepository;
import com.example.homenursing.repository.InvoiceRepository;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private BookingRepository bookingRepository;

    // Create
    public Invoice createInvoice(Invoice invoice) {
        return invoiceRepository.save(invoice);
    }

    // Read all
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    // Read by ID
    public Optional<Invoice> getInvoiceById(Long id) {
        return invoiceRepository.findById(id);
    }

    // Get invoice by booking ID
    public Optional<Invoice> getInvoiceByBookingId(Long bookingId) {
        return invoiceRepository.findByBookingId(bookingId);
    }

    // Get all invoices for a user
    public List<Invoice> getInvoicesByUserId(Long userId) {
        return invoiceRepository.findAllByUserId(userId);
    }

    // Update
    public Invoice updateInvoice(Long id, Invoice invoiceDetails) {
        Optional<Invoice> optionalInvoice = invoiceRepository.findById(id);
        if (optionalInvoice.isPresent()) {
            Invoice invoice = optionalInvoice.get();
            invoice.setBooking(invoiceDetails.getBooking());
            invoice.setInvoiceNumber(invoiceDetails.getInvoiceNumber());
            invoice.setIssuedDate(invoiceDetails.getIssuedDate());
            invoice.setDueDate(invoiceDetails.getDueDate());
            invoice.setAmount(invoiceDetails.getAmount());
            invoice.setStatus(invoiceDetails.getStatus());
            invoice.setNotes(invoiceDetails.getNotes());
            return invoiceRepository.save(invoice);
        } else {
            throw new RuntimeException("Invoice not found with id " + id);
        }
    }

    // Delete
    public void deleteInvoice(Long id) {
        invoiceRepository.deleteById(id);
    }

    // Generate invoice for a booking
    public Invoice generateInvoiceForBooking(Long bookingId) {
        Optional<Booking> optionalBooking = bookingRepository.findById(bookingId);
        if (optionalBooking.isPresent()) {
            Booking booking = optionalBooking.get();
            
            // Use final cost if available, otherwise use estimated cost
            Double amount = booking.getFinalCost() != null && booking.getFinalCost() > 0 
                ? booking.getFinalCost() 
                : booking.getEstimatedCost();
            
            if (amount == null || amount <= 0) {
                throw new RuntimeException("Booking does not have a valid cost");
            }
            
            String invoiceNumber = "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            LocalDate issuedDate = LocalDate.now();
            LocalDate dueDate = issuedDate.plusDays(30); // Due in 30 days
            
            // Determine invoice status based on booking status
            Invoice.InvoiceStatus invoiceStatus = determineInvoiceStatus(booking);
            
            Invoice invoice = Invoice.builder()
                .booking(booking)
                .invoiceNumber(invoiceNumber)
                .issuedDate(issuedDate)
                .dueDate(dueDate)
                .amount(amount)
                .status(invoiceStatus)
                .build();
            return invoiceRepository.save(invoice);
        } else {
            throw new RuntimeException("Booking not found with id " + bookingId);
        }
    }

    // Helper method to determine invoice status based on booking status
    private Invoice.InvoiceStatus determineInvoiceStatus(Booking booking) {
        if (booking.getStatus() == null) {
            return Invoice.InvoiceStatus.PENDING;
        }
        
        switch (booking.getStatus()) {
            case COMPLETED:
                return Invoice.InvoiceStatus.PAID;
            case CANCELLED:
                return Invoice.InvoiceStatus.CANCELLED;
            case PENDING:
            case IN_PROGRESS:
            default:
                return Invoice.InvoiceStatus.PENDING;
        }
    }

    // Check if user has access to a booking (owns it, is assigned to it, or is admin)
    public boolean hasAccessToBooking(User user, Long bookingId) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (!bookingOpt.isPresent()) {
            return false;
        }

        Booking booking = bookingOpt.get();
        
        // Admin has access to all bookings
        if (user.getRole() == User.Role.ADMIN) {
            return true;
        }
        
        // Patient has access to their own bookings
        if (user.getRole() == User.Role.PATIENT && booking.getUser() != null && booking.getUser().getId().equals(user.getId())) {
            return true;
        }
        
        // Nurse has access to bookings assigned to them
        if (user.getRole() == User.Role.NURSE && booking.getNurse() != null && booking.getNurse().getId().equals(user.getId())) {
            return true;
        }
        
        return false;
    }
}