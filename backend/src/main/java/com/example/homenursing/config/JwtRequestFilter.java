package com.example.homenursing.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.homenursing.util.JwtUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        try {
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                jwt = authorizationHeader.substring(7);
                System.out.println("JWT extracted: " + jwt.substring(0, Math.min(20, jwt.length())) + "...");
                try {
                    username = jwtUtil.extractUsername(jwt);
                    System.out.println("Extracted username: " + username);
                } catch (Exception e) {
                    System.out.println("Error extracting username: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("No Authorization header or not Bearer token for: " + request.getRequestURI());
            }

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                try {
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                    System.out.println("Loaded user: " + userDetails.getUsername() + ", authorities: " + userDetails.getAuthorities());
                    if (jwtUtil.validateToken(jwt, username)) {
                        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                        System.out.println("Authentication set for: " + username);
                    } else {
                        System.out.println("Token validation failed for: " + username);
                    }
                } catch (Exception e) {
                    System.out.println("Error in filter: " + e.getMessage());
                    e.printStackTrace();
                }
            }
        } catch (Exception e) {
            System.out.println("Unexpected error in JWT filter: " + e.getMessage());
            e.printStackTrace();
        }
        
        chain.doFilter(request, response);
    }
}