package com.example.homenursing.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.homenursing.entity.Booking;
import com.example.homenursing.entity.Invoice;
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
            if (booking.getFinalCost() == null || booking.getFinalCost() <= 0) {
                throw new RuntimeException("Booking does not have a valid final cost");
            }
            String invoiceNumber = "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            LocalDate issuedDate = LocalDate.now();
            LocalDate dueDate = issuedDate.plusDays(30); // Due in 30 days
            Invoice invoice = Invoice.builder()
                .booking(booking)
                .invoiceNumber(invoiceNumber)
                .issuedDate(issuedDate)
                .dueDate(dueDate)
                .amount(booking.getFinalCost())
                .status(Invoice.InvoiceStatus.PENDING)
                .build();
            return invoiceRepository.save(invoice);
        } else {
            throw new RuntimeException("Booking not found with id " + bookingId);
        }
    }
}