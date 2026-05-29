package com.bloodmanagement.controller;

import com.bloodmanagement.dto.DonorDto;
import com.bloodmanagement.entity.BloodType;
import com.bloodmanagement.entity.User;
import com.bloodmanagement.service.AuthService;
import com.bloodmanagement.service.DonorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Donor management REST controller.
 */
@RestController
@RequestMapping("/donors")
public class DonorController {

    @Autowired private DonorService donorService;
    @Autowired private AuthService authService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','BLOOD_BANK','HOSPITAL')")
    public ResponseEntity<List<DonorDto>> getAll() {
        return ResponseEntity.ok(donorService.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','BLOOD_BANK')")
    public ResponseEntity<DonorDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(donorService.getById(id));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<DonorDto> getMyProfile() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(donorService.getByUser(user));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DONOR')")
    public ResponseEntity<DonorDto> update(@PathVariable Long id, @RequestBody DonorDto dto) {
        return ResponseEntity.ok(donorService.update(id, dto));
    }

    @GetMapping("/eligible")
    @PreAuthorize("hasAnyRole('ADMIN','BLOOD_BANK','HOSPITAL')")
    public ResponseEntity<List<DonorDto>> getEligible(
        @RequestParam(required = false) String bloodType) {
        BloodType bt = bloodType != null ? BloodType.fromDisplayName(bloodType) : null;
        return ResponseEntity.ok(donorService.getEligible(bt));
    }

    @GetMapping("/{id}/eligibility")
    public ResponseEntity<Map<String, Object>> checkEligibility(@PathVariable Long id) {
        return ResponseEntity.ok(donorService.checkEligibility(id));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(donorService.getStats());
    }
}
