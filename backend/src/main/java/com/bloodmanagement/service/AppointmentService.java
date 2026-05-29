package com.bloodmanagement.service;

import com.bloodmanagement.dto.AppointmentDto;
import com.bloodmanagement.entity.Appointment;
import com.bloodmanagement.entity.Appointment.AppointmentStatus;
import com.bloodmanagement.entity.BloodBank;
import com.bloodmanagement.entity.Donor;
import com.bloodmanagement.entity.User;
import com.bloodmanagement.exception.BadRequestException;
import com.bloodmanagement.exception.ResourceNotFoundException;
import com.bloodmanagement.repository.AppointmentRepository;
import com.bloodmanagement.repository.BloodBankRepository;
import com.bloodmanagement.repository.DonorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Appointment scheduling service.
 */
@Service
public class AppointmentService {

    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private DonorRepository donorRepository;
    @Autowired private BloodBankRepository bloodBankRepository;
    @Autowired private NotificationService notificationService;

    public List<AppointmentDto> getAll() {
        return appointmentRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<AppointmentDto> getMyAppointments(User user) {
        Donor donor = donorRepository.findByUser(user)
            .orElseThrow(() -> new ResourceNotFoundException("Donor profile not found"));
        return appointmentRepository.findByDonorOrderByScheduledDateDesc(donor).stream()
            .map(this::toDto).collect(Collectors.toList());
    }

    public List<AppointmentDto> getUpcoming(User user) {
        Donor donor = donorRepository.findByUser(user)
            .orElseThrow(() -> new ResourceNotFoundException("Donor profile not found"));
        return appointmentRepository.findUpcomingByDonor(donor, LocalDate.now()).stream()
            .map(this::toDto).collect(Collectors.toList());
    }

    public AppointmentDto getById(Long id) {
        return toDto(appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment", id)));
    }

    @Transactional
    public AppointmentDto create(AppointmentDto dto, User user) {
        Donor donor = donorRepository.findByUser(user)
            .orElseThrow(() -> new ResourceNotFoundException("Donor profile not found"));
        BloodBank bloodBank = bloodBankRepository.findById(dto.getBloodBankId())
            .orElseThrow(() -> new ResourceNotFoundException("BloodBank", dto.getBloodBankId()));

        Appointment appointment = Appointment.builder()
            .donor(donor)
            .bloodBank(bloodBank)
            .scheduledDate(dto.getScheduledDate())
            .scheduledTime(dto.getScheduledTime())
            .status(AppointmentStatus.SCHEDULED)
            .notes(dto.getNotes())
            .build();

        Appointment saved = appointmentRepository.save(appointment);

        notificationService.createNotification(
            user, "Appointment Booked",
            "Your donation appointment at " + bloodBank.getName() + " on " + dto.getScheduledDate() + " is confirmed.",
            com.bloodmanagement.entity.Notification.NotificationType.APPOINTMENT_REMINDER,
            saved.getId(), "Appointment"
        );

        return toDto(saved);
    }

    @Transactional
    public AppointmentDto cancel(Long id) {
        Appointment a = appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
        if (a.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Completed appointments cannot be cancelled.");
        }
        a.setStatus(AppointmentStatus.CANCELLED);
        return toDto(appointmentRepository.save(a));
    }

    @Transactional
    public AppointmentDto confirm(Long id) {
        Appointment a = appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
        a.setStatus(AppointmentStatus.CONFIRMED);
        return toDto(appointmentRepository.save(a));
    }

    @Transactional
    public AppointmentDto complete(Long id) {
        Appointment a = appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
        a.setStatus(AppointmentStatus.COMPLETED);
        return toDto(appointmentRepository.save(a));
    }

    private AppointmentDto toDto(Appointment a) {
        AppointmentDto dto = new AppointmentDto();
        dto.setId(a.getId());
        dto.setDonorId(a.getDonor().getId());
        dto.setDonorName(a.getDonor().getUser().getFirstName() + " " + a.getDonor().getUser().getLastName());
        dto.setBloodBankId(a.getBloodBank().getId());
        dto.setBloodBankName(a.getBloodBank().getName());
        dto.setScheduledDate(a.getScheduledDate());
        dto.setScheduledTime(a.getScheduledTime());
        dto.setStatus(a.getStatus());
        dto.setNotes(a.getNotes());
        dto.setCreatedAt(a.getCreatedAt());
        return dto;
    }
}
