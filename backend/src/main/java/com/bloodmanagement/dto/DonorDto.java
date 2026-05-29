package com.bloodmanagement.dto;

import com.bloodmanagement.entity.BloodType;
import com.bloodmanagement.entity.Donor.DonorStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DonorDto {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private BloodType bloodType;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String city;
    private Double weight;
    private boolean eligible;
    private LocalDate lastDonationDate;
    private LocalDate nextEligibleDate;
    private int totalDonations;
    private DonorStatus status;
}
