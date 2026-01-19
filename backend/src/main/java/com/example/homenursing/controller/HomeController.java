package com.example.homenursing.controller; // package folder

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Home Nursing Service API is running!";
    }

    @GetMapping("/api/bookings")
    public String bookings() {
        return "Booking endpoint works!";
    }
}
