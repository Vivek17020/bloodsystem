package com.bloodmanagement.dto;

import com.bloodmanagement.entity.BloodRequest.RequestStatus;
import com.bloodmanagement.entity.BloodRequest.UrgencyLevel;
import com.bloodmanagement.entity.BloodType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BloodRequestDto {
    private Long id;
    private Long requesterId;
    private String requesterName;
    private String requesterType;
    @NotNull private BloodType bloodType;
    @Min(1) private int units;
    private UrgencyLevel urgency = UrgencyLevel.NORMAL;
    private RequestStatus status;
    @NotBlank private String reason;
    private String patientName;
    private String contactPhone;
    @NotNull private LocalDate requiredByDate;
    private LocalDateTime requestDate;
    private LocalDateTime approvedDate;
    private Long approvedById;
    private String notes;
}
