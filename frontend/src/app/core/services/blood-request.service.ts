import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BloodRequest,
  CreateBloodRequest,
  RequestStatus,
} from '../../shared/models/blood-request.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BloodRequestService {
  private apiUrl = `${environment.apiUrl}/requests`;

  constructor(private http: HttpClient) {}

  getAll(status?: RequestStatus): Observable<BloodRequest[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<BloodRequest[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<BloodRequest> {
    return this.http.get<BloodRequest>(`${this.apiUrl}/${id}`);
  }

  getMyRequests(): Observable<BloodRequest[]> {
    return this.http.get<BloodRequest[]>(`${this.apiUrl}/my`);
  }

  create(request: CreateBloodRequest): Observable<BloodRequest> {
    return this.http.post<BloodRequest>(this.apiUrl, request);
  }

  approve(id: number, notes?: string): Observable<BloodRequest> {
    return this.http.put<BloodRequest>(`${this.apiUrl}/${id}/approve`, { notes });
  }

  reject(id: number, reason: string): Observable<BloodRequest> {
    return this.http.put<BloodRequest>(`${this.apiUrl}/${id}/reject`, { reason });
  }

  cancel(id: number): Observable<BloodRequest> {
    return this.http.put<BloodRequest>(`${this.apiUrl}/${id}/cancel`, {});
  }

  getEmergencyRequests(): Observable<BloodRequest[]> {
    return this.http.get<BloodRequest[]>(`${this.apiUrl}/emergency`);
  }

  getDashboardStats(): Observable<{
    pending: number;
    approved: number;
    critical: number;
    fulfilled: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}
