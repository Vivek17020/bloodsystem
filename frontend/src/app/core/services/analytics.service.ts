import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalDonors: number;
  totalHospitals: number;
  totalBloodBanks: number;
  totalUnitsAvailable: number;
  pendingRequests: number;
  criticalRequests: number;
  todayDonations: number;
  monthlyDonations: number;
  expiringUnits: number;
  lowStockAlerts: number;
}

export interface BloodTypeDistribution {
  bloodType: string;
  count: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  donations: number;
  requests: number;
  fulfilled: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`);
  }

  getBloodTypeDistribution(): Observable<BloodTypeDistribution[]> {
    return this.http.get<BloodTypeDistribution[]>(`${this.apiUrl}/blood-type-distribution`);
  }

  getMonthlyTrend(months: number = 6): Observable<MonthlyTrend[]> {
    return this.http.get<MonthlyTrend[]>(`${this.apiUrl}/monthly-trend?months=${months}`);
  }

  getRequestsByStatus(): Observable<{ status: string; count: number }[]> {
    return this.http.get<any[]>(`${this.apiUrl}/requests-by-status`);
  }

  getTopBloodBanks(): Observable<{ name: string; units: number }[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top-blood-banks`);
  }
}
