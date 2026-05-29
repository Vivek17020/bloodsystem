package com.bloodmanagement.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsDto {
    private long totalDonors;
    private long totalHospitals;
    private long totalBloodBanks;
    private long totalUnitsAvailable;
    private long pendingRequests;
    private long criticalRequests;
    private long todayDonations;
    private long monthlyDonations;
    private long expiringUnits;
    private long lowStockAlerts;
}
