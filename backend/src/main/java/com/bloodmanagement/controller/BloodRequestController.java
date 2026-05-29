package com.bloodmanagement.controller;

import com.bloodmanagement.dto.BloodRequestDto;
import com.bloodmanagement.entity.BloodRequest.RequestStatus;
import com.bloodmanagement.entity.User;
import com.bloodmanagement.service.AuthService;
import com.bloodmanagement.service.BloodRequestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Blood request REST controller — CRUD and approval workflow.
 */
@RestController
@RequestMapping("/requests")
public class BloodRequestController {

    @Autowired private BloodRequestService requestService;
    @Autowired private AuthService authService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','BLOOD_BANK')")
    public ResponseEntity<List<BloodRequestDto>> getAll(
        @RequestParam(required = false) RequestStatus status) {
        List<BloodRequestDto> result = status != null
            ? requestService.getByStatus(status)
            : requestService.getAll();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BloodRequestDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.getById(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BloodRequestDto>> getMyRequests() {
        return ResponseEntity.ok(requestService.getByUser(authService.getCurrentUser()));
    }

    @GetMapping("/emergency")
    @PreAuthorize("hasAnyRole('ADMIN','BLOOD_BANK','HOSPITAL')")
    public ResponseEntity<List<BloodRequestDto>> getEmergency() {
        return ResponseEntity.ok(requestService.getEmergencyRequests());
    }

    @PostMapping
    public ResponseEntity<BloodRequestDto> create(@Valid @RequestBody BloodRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(requestService.create(dto, authService.getCurrentUser()));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','BLOOD_BANK')")
    public ResponseEntity<BloodRequestDto> approve(@PathVariable Long id,
                                                   @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;
        return ResponseEntity.ok(requestService.approve(id, notes, authService.getCurrentUser()));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','BLOOD_BANK')")
    public ResponseEntity<BloodRequestDto> reject(@PathVariable Long id,
                                                  @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(requestService.reject(id, body.get("reason"), authService.getCurrentUser()));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BloodRequestDto> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.cancel(id, authService.getCurrentUser()));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(requestService.getStats());
    }
}
