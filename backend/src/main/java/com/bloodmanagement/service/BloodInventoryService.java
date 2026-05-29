package com.bloodmanagement.service;

import com.bloodmanagement.dto.BloodInventoryDto;
import com.bloodmanagement.dto.BloodStockSummaryDto;
import com.bloodmanagement.entity.*;
import com.bloodmanagement.entity.BloodInventory.InventoryStatus;
import com.bloodmanagement.exception.ResourceNotFoundException;
import com.bloodmanagement.repository.BloodBankRepository;
import com.bloodmanagement.repository.BloodInventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Blood inventory management service.
 */
@Service
public class BloodInventoryService {

    @Autowired private BloodInventoryRepository inventoryRepository;
    @Autowired private BloodBankRepository bloodBankRepository;
    @Autowired private NotificationService notificationService;

    public List<BloodInventoryDto> getAll() {
        return inventoryRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<BloodInventoryDto> getByBloodType(BloodType bloodType) {
        return inventoryRepository.findByBloodType(bloodType).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<BloodInventoryDto> getByStatus(InventoryStatus status) {
        return inventoryRepository.findByStatus(status).stream().map(this::toDto).collect(Collectors.toList());
    }

    public BloodInventoryDto getById(Long id) {
        return toDto(inventoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("BloodInventory", id)));
    }

    @Transactional
    public BloodInventoryDto create(BloodInventoryDto dto, Long bloodBankId) {
        BloodBank bloodBank = bloodBankRepository.findById(bloodBankId)
            .orElseThrow(() -> new ResourceNotFoundException("BloodBank", bloodBankId));

        BloodInventory item = BloodInventory.builder()
            .bloodType(dto.getBloodType())
            .units(dto.getUnits())
            .collectionDate(dto.getCollectionDate())
            .expiryDate(dto.getExpiryDate())
            .status(InventoryStatus.AVAILABLE)
            .bloodBank(bloodBank)
            .notes(dto.getNotes())
            .build();

        return toDto(inventoryRepository.save(item));
    }

    @Transactional
    public BloodInventoryDto update(Long id, BloodInventoryDto dto) {
        BloodInventory item = inventoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("BloodInventory", id));
        if (dto.getUnits() > 0) item.setUnits(dto.getUnits());
        if (dto.getStatus() != null) item.setStatus(dto.getStatus());
        if (dto.getNotes() != null) item.setNotes(dto.getNotes());
        return toDto(inventoryRepository.save(item));
    }

    @Transactional
    public void delete(Long id) {
        inventoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("BloodInventory", id));
        inventoryRepository.deleteById(id);
    }

    public List<BloodStockSummaryDto> getStockSummary() {
        List<BloodStockSummaryDto> result = new ArrayList<>();
        LocalDate sevenDaysFromNow = LocalDate.now().plusDays(7);

        for (BloodType bt : BloodType.values()) {
            long available = inventoryRepository.findByBloodTypeAndStatus(bt, InventoryStatus.AVAILABLE).stream()
                .mapToLong(BloodInventory::getUnits).sum();
            long reserved = inventoryRepository.findByBloodTypeAndStatus(bt, InventoryStatus.RESERVED).stream()
                .mapToLong(BloodInventory::getUnits).sum();
            long expiring = inventoryRepository.findExpiringSoon(sevenDaysFromNow).stream()
                .filter(i -> i.getBloodType() == bt).mapToLong(BloodInventory::getUnits).sum();

            result.add(new BloodStockSummaryDto(bt, available + reserved, available, reserved, expiring));
        }
        return result;
    }

    public List<BloodInventoryDto> getExpiringItems(int days) {
        LocalDate expiryDate = LocalDate.now().plusDays(days);
        return inventoryRepository.findExpiringSoon(expiryDate).stream().map(this::toDto).collect(Collectors.toList());
    }

    /** Scheduled job — marks expired inventory at midnight. */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void markExpiredInventory() {
        List<BloodInventory> expiredItems = inventoryRepository.findByStatus(InventoryStatus.AVAILABLE).stream()
            .filter(i -> i.getExpiryDate().isBefore(LocalDate.now()))
            .collect(Collectors.toList());

        expiredItems.forEach(i -> i.setStatus(InventoryStatus.EXPIRED));
        inventoryRepository.saveAll(expiredItems);
    }

    private BloodInventoryDto toDto(BloodInventory item) {
        BloodInventoryDto dto = new BloodInventoryDto();
        dto.setId(item.getId());
        dto.setBloodType(item.getBloodType());
        dto.setUnits(item.getUnits());
        dto.setCollectionDate(item.getCollectionDate());
        dto.setExpiryDate(item.getExpiryDate());
        dto.setStatus(item.getStatus());
        dto.setBloodBankId(item.getBloodBank().getId());
        dto.setBloodBankName(item.getBloodBank().getName());
        dto.setNotes(item.getNotes());
        return dto;
    }
}
