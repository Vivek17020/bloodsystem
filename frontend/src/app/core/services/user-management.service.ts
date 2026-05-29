import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role } from '../models/user.model';

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
  enabled: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
  bloodType?: string;
  organizationName?: string;
}

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(this.apiUrl);
  }

  getById(id: number): Observable<UserSummary> {
    return this.http.get<UserSummary>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateUserRequest): Observable<UserSummary> {
    return this.http.post<UserSummary>(this.apiUrl, data);
  }

  activate(id: number): Observable<UserSummary> {
    return this.http.put<UserSummary>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<UserSummary> {
    return this.http.put<UserSummary>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  changeRole(id: number, role: string): Observable<UserSummary> {
    return this.http.put<UserSummary>(`${this.apiUrl}/${id}/role`, { role });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  resetPassword(id: number, newPassword: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}/password`, { newPassword });
  }
}
