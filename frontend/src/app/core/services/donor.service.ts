import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Donor, DonationHistory } from '../../shared/models/donor.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DonorService {
  private apiUrl = `${environment.apiUrl}/donors`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Donor[]> {
    return this.http.get<Donor[]>(this.apiUrl);
  }

  getById(id: number): Observable<Donor> {
    return this.http.get<Donor>(`${this.apiUrl}/${id}`);
  }

  getMyProfile(): Observable<Donor> {
    return this.http.get<Donor>(`${this.apiUrl}/me`);
  }

  update(id: number, donor: Partial<Donor>): Observable<Donor> {
    return this.http.put<Donor>(`${this.apiUrl}/${id}`, donor);
  }

  getDonationHistory(donorId: number): Observable<DonationHistory[]> {
    return this.http.get<DonationHistory[]>(`${this.apiUrl}/${donorId}/donations`);
  }

  getEligibleDonors(bloodType?: string): Observable<Donor[]> {
    const url = bloodType
      ? `${this.apiUrl}/eligible?bloodType=${bloodType}`
      : `${this.apiUrl}/eligible`;
    return this.http.get<Donor[]>(url);
  }

  checkEligibility(donorId: number): Observable<{ eligible: boolean; reason?: string }> {
    return this.http.get<any>(`${this.apiUrl}/${donorId}/eligibility`);
  }

  getDonorStats(): Observable<{
    totalDonors: number;
    activeDonors: number;
    todayDonations: number;
    monthlyDonations: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}
