package com.bloodmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Donor profile — linked 1:1 to a User with DONOR role.
 */
@Entity
@Table(name = "donors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Donor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodType bloodType;

    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String city;
    private Double weight;

    private boolean eligible = true;

    private LocalDate lastDonationDate;
    private LocalDate nextEligibleDate;

    @Column(columnDefinition = "INT DEFAULT 0")
    private int totalDonations = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonorStatus status = DonorStatus.ACTIVE;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public enum DonorStatus {
        ACTIVE, INACTIVE, DEFERRED, BANNED
    }
}
