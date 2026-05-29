package com.bloodmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Blood request submitted by a hospital or individual.
 */
@Entity
@Table(name = "blood_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BloodRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodType bloodType;

    @Column(nullable = false)
    private int units;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UrgencyLevel urgency = UrgencyLevel.NORMAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(nullable = false)
    private String reason;

    private String patientName;
    private String contactPhone;

    @Column(nullable = false)
    private LocalDate requiredByDate;

    private LocalDateTime approvedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_id")
    private User approvedBy;

    private String notes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime requestDate;

    public enum UrgencyLevel {
        NORMAL, URGENT, CRITICAL
    }

    public enum RequestStatus {
        PENDING, APPROVED, REJECTED, FULFILLED, CANCELLED
    }
}
