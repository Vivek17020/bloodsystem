import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BloodRequestService } from '../../../core/services/blood-request.service';
import { BloodRequest, RequestStatus, UrgencyLevel } from '../../../shared/models/blood-request.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-hospital-dashboard',
  templateUrl: './hospital-dashboard.component.html',
  styleUrls: ['./hospital-dashboard.component.scss'],
})
export class HospitalDashboardComponent implements OnInit {
  myRequests: BloodRequest[] = [];
  requestForm!: FormGroup;
  showForm = false;
  isLoading = true;
  isSubmitting = false;

  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  urgencyLevels = [UrgencyLevel.NORMAL, UrgencyLevel.URGENT, UrgencyLevel.CRITICAL];
  columns = ['bloodType', 'units', 'urgency', 'status', 'requestDate', 'actions'];

  constructor(
    private fb: FormBuilder,
    private requestService: BloodRequestService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRequests();
  }

  initForm(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.requestForm = this.fb.group({
      bloodType:       ['', Validators.required],
      units:           [1, [Validators.required, Validators.min(1)]],
      urgency:         [UrgencyLevel.NORMAL, Validators.required],
      reason:          ['', Validators.required],
      patientName:     [''],
      contactPhone:    [''],
      requiredByDate:  [tomorrow.toISOString().split('T')[0], Validators.required],
    });
  }

  loadRequests(): void {
    this.requestService.getMyRequests().subscribe({
      next: (reqs) => { this.myRequests = reqs; this.isLoading = false; },
      error: () => { this.isLoading = false; },
    });
  }

  onSubmit(): void {
    if (this.requestForm.invalid) { this.requestForm.markAllAsTouched(); return; }
    this.isSubmitting = true;
    this.requestService.create(this.requestForm.value).subscribe({
      next: () => {
        this.notificationService.showToast('Blood request submitted successfully!', 'success');
        this.showForm = false;
        this.loadRequests();
        this.isSubmitting = false;
        this.initForm();
      },
      error: () => { this.isSubmitting = false; },
    });
  }

  cancelRequest(id: number): void {
    this.requestService.cancel(id).subscribe(() => {
      this.notificationService.showToast('Request cancelled.', 'info');
      this.loadRequests();
    });
  }

  getStatusClass(status: string): string {
    const m: Record<string, string> = { PENDING: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-critical', FULFILLED: 'badge-info', CANCELLED: 'badge-info' };
    return m[status] || 'badge-info';
  }

  getUrgencyClass(u: string): string {
    const m: Record<string, string> = { CRITICAL: 'badge-critical', URGENT: 'badge-warning', NORMAL: 'badge-info' };
    return m[u] || 'badge-info';
  }
}
