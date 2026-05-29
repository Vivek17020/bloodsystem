package com.bloodmanagement.dto;

import com.bloodmanagement.entity.Appointment.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class AppointmentDto {
    private Long id;
    private Long donorId;
    private String donorName;
    @NotNull private Long bloodBankId;
    private String bloodBankName;
    @NotNull private LocalDate scheduledDate;
    @NotNull private LocalTime scheduledTime;
    private AppointmentStatus status;
    private String notes;
    private LocalDateTime createdAt;
}
