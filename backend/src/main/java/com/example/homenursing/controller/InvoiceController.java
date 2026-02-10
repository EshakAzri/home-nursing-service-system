package com.example.homenursing.controller;

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

import com.example.homenursing.entity.Invoice;
import com.example.homenursing.entity.User;
import com.example.homenursing.service.InvoiceService;
import com.example.homenursing.service.UserService;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "http://localhost:5173")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private UserService userService;

    // GET /api/invoices - Get all invoices
    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        List<Invoice> invoices = invoiceService.getAllInvoices();
        return ResponseEntity.ok(invoices);
    }

    // GET /api/invoices/{id} - Get invoice by ID
    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
        Optional<Invoice> invoice = invoiceService.getInvoiceById(id);
        if (invoice.isPresent()) {
            return ResponseEntity.ok(invoice.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /api/invoices/my-invoices - Get all invoices for the current user
    @GetMapping("/my-invoices/all")
    public ResponseEntity<?> getMyInvoices() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }

            String username = authentication.getName();
            Optional<User> userOpt = userService.findByUsername(username);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            List<Invoice> invoices = invoiceService.getInvoicesByUserId(userOpt.get().getId());
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/invoices/booking/{bookingId} - Get invoice for a specific booking
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getInvoiceByBookingId(@PathVariable Long bookingId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }

            String username = authentication.getName();
            Optional<User> userOpt = userService.findByUsername(username);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            // Check if user has access to this booking
            if (!invoiceService.hasAccessToBooking(userOpt.get(), bookingId)) {
                return ResponseEntity.status(403).body(Map.of("error", "You don't have permission to access this invoice"));
            }

            Optional<Invoice> invoice = invoiceService.getInvoiceByBookingId(bookingId);
            if (invoice.isPresent()) {
                return ResponseEntity.ok(invoice.get());
            } else {
                return ResponseEntity.status(404).body(Map.of("error", "Invoice not found for this booking"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // POST /api/invoices - Create a new invoice
    @PostMapping
    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
        try {
            Invoice createdInvoice = invoiceService.createInvoice(invoice);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdInvoice);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // PUT /api/invoices/{id} - Update an existing invoice
    @PutMapping("/{id}")
    public ResponseEntity<Invoice> updateInvoice(@PathVariable Long id, @RequestBody Invoice invoiceDetails) {
        try {
            Invoice updatedInvoice = invoiceService.updateInvoice(id, invoiceDetails);
            return ResponseEntity.ok(updatedInvoice);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // DELETE /api/invoices/{id} - Delete an invoice
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        try {
            invoiceService.deleteInvoice(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // POST /api/invoices/generate/{bookingId} - Generate invoice for a booking
    @PostMapping("/generate/{bookingId}")
    public ResponseEntity<?> generateInvoiceForBooking(@PathVariable Long bookingId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("Generate invoice request for booking: " + bookingId);
            System.out.println("Authentication: " + (authentication != null ? "exists" : "NULL"));
            if (authentication != null) {
                System.out.println("Authentication principal: " + authentication.getPrincipal());
                System.out.println("Is authenticated: " + authentication.isAuthenticated());
            }
            
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }
            
            String username = authentication.getName();
            Optional<User> userOpt = userService.findByUsername(username);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            // Check if user has access to this booking
            if (!invoiceService.hasAccessToBooking(userOpt.get(), bookingId)) {
                return ResponseEntity.status(403).body(Map.of("error", "You don't have permission to generate invoice for this booking"));
            }
            
            Invoice generatedInvoice = invoiceService.generateInvoiceForBooking(bookingId);
            return ResponseEntity.status(HttpStatus.CREATED).body(generatedInvoice);
        } catch (RuntimeException e) {
            System.out.println("RuntimeException: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.out.println("Exception: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}