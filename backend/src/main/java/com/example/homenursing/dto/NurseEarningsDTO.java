package com.example.homenursing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NurseEarningsDTO {
    private Long nurseId;
    private String firstName;
    private String lastName;
    private String email;
    private String specialization;
    private Double hourlyRate;
    private Long completedBookings;
    private Double totalEarnings;
    private Double commission; // 10% of total earnings
    private String month; // Format: "YYYY-MM"
}
