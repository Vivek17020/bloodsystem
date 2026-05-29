import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../../core/services/appointment.service';
import { Appointment, AppointmentStatus } from '../../shared/models/appointment.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-appointments-page',
  templateUrl: './appointments-page.component.html',
  styleUrls: ['./appointments-page.component.scss'],
})
export class AppointmentsPageComponent implements OnInit {
  appointments: Appointment[] = [];
  showForm = false;
  isSubmitting = false;
  bookForm!: FormGroup;

  columns = ['scheduledDate', 'scheduledTime', 'bloodBankName', 'status', 'notes', 'actions'];

  constructor(
    private appointmentService: AppointmentService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAppointments();
  }

  initForm(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.bookForm = this.fb.group({
      bloodBankId:    [null, Validators.required],
      scheduledDate:  [tomorrow.toISOString().split('T')[0], Validators.required],
      scheduledTime:  ['09:00', Validators.required],
      notes:          [''],
    });
  }

  loadAppointments(): void {
    this.appointmentService.getMyAppointments().subscribe((appts) => {
      this.appointments = appts;
    });
  }

  onSubmit(): void {
    if (this.bookForm.invalid) { this.bookForm.markAllAsTouched(); return; }
    this.isSubmitting = true;
    this.appointmentService.create(this.bookForm.value).subscribe({
      next: () => {
        this.notificationService.showToast('Appointment booked!', 'success');
        this.showForm = false;
        this.loadAppointments();
        this.isSubmitting = false;
        this.initForm();
      },
      error: () => { this.isSubmitting = false; },
    });
  }

  cancel(id: number): void {
    this.appointmentService.cancel(id).subscribe(() => {
      this.notificationService.showToast('Appointment cancelled.', 'info');
      this.loadAppointments();
    });
  }

  getStatusClass(s: string): string {
    const m: Record<string, string> = {
      SCHEDULED: 'badge-info', CONFIRMED: 'badge-success',
      COMPLETED: 'badge-success', CANCELLED: 'badge-critical', NO_SHOW: 'badge-warning',
    };
    return m[s] || 'badge-info';
  }
}
