package com.bloodmanagement.service;

import com.bloodmanagement.dto.DashboardStatsDto;
import com.bloodmanagement.entity.BloodInventory.InventoryStatus;
import com.bloodmanagement.entity.BloodRequest.RequestStatus;
import com.bloodmanagement.entity.BloodRequest.UrgencyLevel;
import com.bloodmanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Analytics service — aggregated stats for dashboards and reports.
 */
@Service
public class AnalyticsService {

    @Autowired private UserRepository userRepository;
    @Autowired private DonorRepository donorRepository;
    @Autowired private HospitalRepository hospitalRepository;
    @Autowired private BloodBankRepository bloodBankRepository;
    @Autowired private BloodInventoryRepository inventoryRepository;
    @Autowired private BloodRequestRepository requestRepository;

    public DashboardStatsDto getDashboardStats() {
        long totalUnits = inventoryRepository.findByStatus(InventoryStatus.AVAILABLE).stream()
            .mapToLong(i -> i.getUnits()).sum();
        long expiringUnits = inventoryRepository.findExpiringSoon(LocalDate.now().plusDays(7)).size();

        return DashboardStatsDto.builder()
            .totalDonors(donorRepository.count())
            .totalHospitals(hospitalRepository.count())
            .totalBloodBanks(bloodBankRepository.count())
            .totalUnitsAvailable(totalUnits)
            .pendingRequests(requestRepository.countByStatus(RequestStatus.PENDING))
            .criticalRequests(requestRepository.countByUrgency(UrgencyLevel.CRITICAL))
            .todayDonations(0L)
            .monthlyDonations(0L)
            .expiringUnits(expiringUnits)
            .lowStockAlerts(0L)
            .build();
    }

    public List<Map<String, Object>> getBloodTypeDistribution() {
        List<Object[]> data = inventoryRepository.getAvailableUnitsByBloodType();
        long total = data.stream().mapToLong(row -> ((Number) row[1]).longValue()).sum();
        return data.stream().map(row -> {
            long count = ((Number) row[1]).longValue();
            double percentage = total > 0 ? (count * 100.0 / total) : 0;
            return Map.<String, Object>of(
                "bloodType", row[0].toString(),
                "count", count,
                "percentage", Math.round(percentage * 10.0) / 10.0
            );
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getRequestsByStatus() {
        return List.of(
            Map.of("status", "PENDING",   "count", requestRepository.countByStatus(RequestStatus.PENDING)),
            Map.of("status", "APPROVED",  "count", requestRepository.countByStatus(RequestStatus.APPROVED)),
            Map.of("status", "REJECTED",  "count", requestRepository.countByStatus(RequestStatus.REJECTED)),
            Map.of("status", "FULFILLED", "count", requestRepository.countByStatus(RequestStatus.FULFILLED))
        );
    }

    public List<Map<String, Object>> getTopBloodBanks() {
        return bloodBankRepository.findAll().stream().map(bb -> {
            long units = inventoryRepository.findByBloodBankId(bb.getId()).stream()
                .filter(i -> i.getStatus() == InventoryStatus.AVAILABLE)
                .mapToLong(i -> i.getUnits()).sum();
            return Map.<String, Object>of("name", bb.getName(), "units", units);
        }).sorted((a, b) -> Long.compare((long) b.get("units"), (long) a.get("units")))
          .limit(5).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getMonthlyTrend(int months) {
        // Returns placeholder trend data — wire to real DB queries in production
        return java.util.stream.IntStream.rangeClosed(1, months).mapToObj(i -> {
            java.time.LocalDate date = LocalDate.now().minusMonths(months - i);
            return Map.<String, Object>of(
                "month", date.getMonth().getDisplayName(java.time.format.TextStyle.SHORT, java.util.Locale.ENGLISH)
                    + " " + date.getYear(),
                "donations", (long)(Math.random() * 40 + 10),
                "requests",  (long)(Math.random() * 30 + 5),
                "fulfilled", (long)(Math.random() * 25 + 5)
            );
        }).collect(Collectors.toList());
    }
}
