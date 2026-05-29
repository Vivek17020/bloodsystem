import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BloodInventory,
  InventoryFilter,
  BloodStockSummary,
} from '../../shared/models/blood-inventory.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BloodInventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getAll(filter?: InventoryFilter): Observable<BloodInventory[]> {
    let params = new HttpParams();
    if (filter?.bloodType) params = params.set('bloodType', filter.bloodType);
    if (filter?.status) params = params.set('status', filter.status);
    if (filter?.bloodBankId) params = params.set('bloodBankId', filter.bloodBankId);
    if (filter?.fromDate) params = params.set('fromDate', filter.fromDate);
    if (filter?.toDate) params = params.set('toDate', filter.toDate);
    return this.http.get<BloodInventory[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<BloodInventory> {
    return this.http.get<BloodInventory>(`${this.apiUrl}/${id}`);
  }

  create(inventory: Partial<BloodInventory>): Observable<BloodInventory> {
    return this.http.post<BloodInventory>(this.apiUrl, inventory);
  }

  update(id: number, inventory: Partial<BloodInventory>): Observable<BloodInventory> {
    return this.http.put<BloodInventory>(`${this.apiUrl}/${id}`, inventory);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStockSummary(): Observable<BloodStockSummary[]> {
    return this.http.get<BloodStockSummary[]>(`${this.apiUrl}/summary`);
  }

  getExpiringItems(days: number = 7): Observable<BloodInventory[]> {
    return this.http.get<BloodInventory[]>(`${this.apiUrl}/expiring?days=${days}`);
  }

  getLowStockAlerts(): Observable<BloodStockSummary[]> {
    return this.http.get<BloodStockSummary[]>(`${this.apiUrl}/low-stock`);
  }
}
