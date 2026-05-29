import { Component, OnInit } from '@angular/core';
import { BloodRequestService } from '../../core/services/blood-request.service';
import { BloodRequest, UrgencyLevel, RequestStatus } from '../../shared/models/blood-request.model';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Role } from '../../core/models/user.model';

@Component({
  selector: 'app-emergency-request-page',
  templateUrl: './emergency-request-page.component.html',
  styleUrls: ['./emergency-request-page.component.scss'],
})
export class EmergencyRequestPageComponent implements OnInit {
  emergencyRequests: BloodRequest[] = [];
  allRequests: BloodRequest[] = [];
  selectedTab = 0;
  isLoading = true;

  columns = ['bloodType', 'requesterName', 'units', 'urgency', 'status', 'requestDate', 'actions'];

  constructor(
    private requestService: BloodRequestService,
    public authService: AuthService,
    private notificationService: NotificationService
  ) {}

  get isAdmin(): boolean { return this.authService.hasRole(Role.ADMIN); }
  get isBloodBank(): boolean { return this.authService.hasRole(Role.BLOOD_BANK); }
  get canApprove(): boolean { return this.isAdmin || this.isBloodBank; }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.requestService.getEmergencyRequests().subscribe({
      next: (reqs) => { this.emergencyRequests = reqs; this.isLoading = false; },
      error: () => { this.isLoading = false; },
    });
    this.requestService.getAll().subscribe((reqs) => {
      this.allRequests = reqs;
    });
  }

  approve(id: number): void {
    this.requestService.approve(id).subscribe(() => {
      this.notificationService.showToast('Request approved!', 'success');
      this.loadData();
    });
  }

  reject(id: number): void {
    this.requestService.reject(id, 'Insufficient stock').subscribe(() => {
      this.notificationService.showToast('Request rejected.', 'info');
      this.loadData();
    });
  }

  getUrgencyClass(u: string): string {
    const m: Record<string, string> = { CRITICAL: 'badge-critical', URGENT: 'badge-warning', NORMAL: 'badge-info' };
    return m[u] || 'badge-info';
  }

  getStatusClass(s: string): string {
    const m: Record<string, string> = { PENDING: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-critical', FULFILLED: 'badge-info' };
    return m[s] || 'badge-info';
  }
}
