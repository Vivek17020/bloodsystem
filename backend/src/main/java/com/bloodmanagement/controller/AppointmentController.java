package com.bloodmanagement.controller;

import com.bloodmanagement.dto.AppointmentDto;
import com.bloodmanagement.entity.User;
import com.bloodmanagement.service.AppointmentService;
import com.bloodmanagement.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Appointment REST controller — booking and management.
 */
@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    @Autowired private AppointmentService appointmentService;
    @Autowired private AuthService authService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','BLOOD_BANK')")
    public ResponseEntity<List<AppointmentDto>> getAll() {
        return ResponseEntity.ok(appointmentService.getAll());
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<List<AppointmentDto>> getMyAppointments() {
        return ResponseEntity.ok(appointmentService.getMyAppointments(authService.getCurrentUser()));
    }

    @GetMapping("/upcoming")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<List<AppointmentDto>> getUpcoming() {
        return ResponseEntity.ok(appointmentService.getUpcoming(authService.getCurrentUser()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<AppointmentDto> create(@Valid @RequestBody AppointmentDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(appointmentService.create(dto, authService.getCurrentUser()));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<AppointmentDto> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancel(id));
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN','BLOOD_BANK')")
    public ResponseEntity<AppointmentDto> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.confirm(id));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN','BLOOD_BANK')")
    public ResponseEntity<AppointmentDto> complete(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.complete(id));
    }
}
