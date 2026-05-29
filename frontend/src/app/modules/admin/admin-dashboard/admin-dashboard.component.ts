import { Component, OnInit } from '@angular/core';
import { AnalyticsService, DashboardStats, MonthlyTrend, BloodTypeDistribution } from '../../../core/services/analytics.service';
import { BloodRequestService } from '../../../core/services/blood-request.service';
import { BloodRequest } from '../../../shared/models/blood-request.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  recentRequests: BloodRequest[] = [];
  bloodTypeDistribution: BloodTypeDistribution[] = [];
  monthlyTrend: MonthlyTrend[] = [];
  isLoading = true;

  requestColumns = ['id', 'requesterName', 'bloodType', 'units', 'urgency', 'status', 'requestDate'];

  constructor(
    private analyticsService: AnalyticsService,
    private requestService: BloodRequestService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.analyticsService.getDashboardStats().subscribe({
      next: (stats) => { this.stats = stats; this.isLoading = false; },
      error: () => { this.isLoading = false; },
    });

    this.requestService.getAll().subscribe((reqs) => {
      this.recentRequests = reqs.slice(0, 10);
    });

    this.analyticsService.getBloodTypeDistribution().subscribe((data) => {
      this.bloodTypeDistribution = data;
    });

    this.analyticsService.getMonthlyTrend().subscribe((data) => {
      this.monthlyTrend = data;
    });
  }

  getUrgencyClass(urgency: string): string {
    const map: Record<string, string> = {
      CRITICAL: 'badge-critical',
      URGENT: 'badge-warning',
      NORMAL: 'badge-info',
    };
    return map[urgency] || 'badge-info';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'badge-warning',
      APPROVED: 'badge-success',
      REJECTED: 'badge-critical',
      FULFILLED: 'badge-info',
    };
    return map[status] || 'badge-info';
  }
}
