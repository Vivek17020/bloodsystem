package com.bloodmanagement.dto;

import com.bloodmanagement.entity.BloodType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BloodStockSummaryDto {
    private BloodType bloodType;
    private long totalUnits;
    private long availableUnits;
    private long reservedUnits;
    private long expiringUnits;
}
