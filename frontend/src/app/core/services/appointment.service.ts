import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Appointment,
  CreateAppointment,
  AppointmentStatus,
} from '../../shared/models/appointment.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiUrl);
  }

  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/my`);
  }

  getById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }

  create(appointment: CreateAppointment): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, appointment);
  }

  update(id: number, appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${id}`, appointment);
  }

  cancel(id: number): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${id}/cancel`, {});
  }

  confirm(id: number): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${id}/confirm`, {});
  }

  complete(id: number): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${id}/complete`, {});
  }

  getUpcoming(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/upcoming`);
  }
}
