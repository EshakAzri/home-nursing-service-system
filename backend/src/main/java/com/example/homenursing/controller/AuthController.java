package com.example.homenursing.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.homenursing.entity.User;
import com.example.homenursing.service.UserService;
import com.example.homenursing.util.JwtUtil;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // Allow frontend
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            return ResponseEntity.ok(Map.of("message", "User registered successfully", "userId", registeredUser.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (userService.checkPassword(password, user.getPassword())) {
                String token = jwtUtil.generateToken(username);
                return ResponseEntity.ok(Map.of("token", token, "role", user.getRole()));
            }
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
    }

    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        boolean available = userService.isUsernameAvailable(username);
        return ResponseEntity.ok(Map.of("available", available));
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        boolean available = userService.isEmailAvailable(email);
        return ResponseEntity.ok(Map.of("available", available));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            String username = null;
            
            if (principal instanceof String) {
                username = (String) principal;
            } else if (principal instanceof User) {
                username = ((User) principal).getUsername();
            } else if (principal instanceof org.springframework.security.core.userdetails.User) {
                username = ((org.springframework.security.core.userdetails.User) principal).getUsername();
            }
            
            if (username != null) {
                Optional<User> userOpt = userService.findByUsername(username);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    return ResponseEntity.ok(Map.of(
                        "username", user.getUsername(),
                        "email", user.getEmail()
                    ));
                }
            }
        }
        return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
    }
}