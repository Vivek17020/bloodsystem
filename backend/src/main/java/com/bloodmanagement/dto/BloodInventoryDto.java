package com.bloodmanagement.dto;

import com.bloodmanagement.entity.BloodInventory.InventoryStatus;
import com.bloodmanagement.entity.BloodType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BloodInventoryDto {
    private Long id;
    @NotNull private BloodType bloodType;
    @Min(1) private int units;
    @NotNull private LocalDate collectionDate;
    @NotNull private LocalDate expiryDate;
    private InventoryStatus status;
    private Long bloodBankId;
    private String bloodBankName;
    private Long donorId;
    private String notes;
}
