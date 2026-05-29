package com.bloodmanagement.controller;

import com.bloodmanagement.dto.BloodInventoryDto;
import com.bloodmanagement.dto.BloodStockSummaryDto;
import com.bloodmanagement.entity.User;
import com.bloodmanagement.service.AuthService;
import com.bloodmanagement.service.BloodInventoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Blood inventory REST controller.
 */
@RestController
@RequestMapping("/inventory")
public class BloodInventoryController {

    @Autowired private BloodInventoryService inventoryService;
    @Autowired private AuthService authService;

    @GetMapping
    public ResponseEntity<List<BloodInventoryDto>> getAll() {
        return ResponseEntity.ok(inventoryService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BloodInventoryDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','BLOOD_BANK')")
    public ResponseEntity<BloodInventoryDto> create(@Valid @RequestBody BloodInventoryDto dto) {
        User user = authService.getCurrentUser();
        // Use the blood bank ID from the authenticated user or from DTO
        Long bloodBankId = dto.getBloodBankId() != null ? dto.getBloodBankId() : 1L;
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(inventoryService.create(dto, bloodBankId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','BLOOD_BANK')")
    public ResponseEntity<BloodInventoryDto> update(@PathVariable Long id,
                                                    @RequestBody BloodInventoryDto dto) {
        return ResponseEntity.ok(inventoryService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','BLOOD_BANK')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inventoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<List<BloodStockSummaryDto>> getStockSummary() {
        return ResponseEntity.ok(inventoryService.getStockSummary());
    }

    @GetMapping("/expiring")
    @PreAuthorize("hasAnyRole('ADMIN','BLOOD_BANK')")
    public ResponseEntity<List<BloodInventoryDto>> getExpiring(
        @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(inventoryService.getExpiringItems(days));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN','BLOOD_BANK')")
    public ResponseEntity<List<BloodStockSummaryDto>> getLowStock() {
        return ResponseEntity.ok(inventoryService.getStockSummary());
    }
}
