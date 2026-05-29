import { Component, OnInit } from '@angular/core';
import { AnalyticsService, DashboardStats, MonthlyTrend, BloodTypeDistribution } from '../../../core/services/analytics.service';

@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.scss'],
})
export class AnalyticsPageComponent implements OnInit {
  stats: DashboardStats | null = null;
  monthlyTrend: MonthlyTrend[] = [];
  bloodTypeDistribution: BloodTypeDistribution[] = [];
  requestsByStatus: { status: string; count: number }[] = [];
  topBloodBanks: { name: string; units: number }[] = [];
  isLoading = true;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.analyticsService.getDashboardStats().subscribe((s) => {
      this.stats = s;
      this.isLoading = false;
    });
    this.analyticsService.getMonthlyTrend(12).subscribe((d) => (this.monthlyTrend = d));
    this.analyticsService.getBloodTypeDistribution().subscribe((d) => (this.bloodTypeDistribution = d));
    this.analyticsService.getRequestsByStatus().subscribe((d) => (this.requestsByStatus = d));
    this.analyticsService.getTopBloodBanks().subscribe((d) => (this.topBloodBanks = d));
  }

  getMaxUnits(): number {
    return Math.max(...this.topBloodBanks.map((b) => b.units), 1);
  }

  getBarWidth(units: number): number {
    return (units / this.getMaxUnits()) * 100;
  }
}
