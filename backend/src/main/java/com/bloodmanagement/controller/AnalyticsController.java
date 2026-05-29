package com.bloodmanagement.controller;

import com.bloodmanagement.dto.DashboardStatsDto;
import com.bloodmanagement.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Analytics REST controller — dashboard stats and chart data.
 */
@RestController
@RequestMapping("/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    @Autowired private AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDto> getDashboard() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    @GetMapping("/blood-type-distribution")
    public ResponseEntity<List<Map<String, Object>>> getBloodTypeDistribution() {
        return ResponseEntity.ok(analyticsService.getBloodTypeDistribution());
    }

    @GetMapping("/monthly-trend")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyTrend(
        @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(analyticsService.getMonthlyTrend(months));
    }

    @GetMapping("/requests-by-status")
    public ResponseEntity<List<Map<String, Object>>> getRequestsByStatus() {
        return ResponseEntity.ok(analyticsService.getRequestsByStatus());
    }

    @GetMapping("/top-blood-banks")
    public ResponseEntity<List<Map<String, Object>>> getTopBloodBanks() {
        return ResponseEntity.ok(analyticsService.getTopBloodBanks());
    }
}
