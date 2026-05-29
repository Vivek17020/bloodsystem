import { Component, OnInit } from '@angular/core';
import { BloodInventoryService } from '../../../core/services/blood-inventory.service';
import { BloodRequestService } from '../../../core/services/blood-request.service';
import { BloodInventory, BloodStockSummary } from '../../../shared/models/blood-inventory.model';
import { BloodRequest } from '../../../shared/models/blood-request.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-bloodbank-dashboard',
  templateUrl: './bloodbank-dashboard.component.html',
  styleUrls: ['./bloodbank-dashboard.component.scss'],
})
export class BloodbankDashboardComponent implements OnInit {
  stockSummary: BloodStockSummary[] = [];
  expiringItems: BloodInventory[] = [];
  pendingRequests: BloodRequest[] = [];
  isLoading = true;

  requestColumns = ['bloodType', 'units', 'requesterName', 'urgency', 'requestDate', 'actions'];
  expiryColumns = ['bloodType', 'units', 'expiryDate', 'status'];

  constructor(
    private inventoryService: BloodInventoryService,
    private requestService: BloodRequestService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.inventoryService.getStockSummary().subscribe({
      next: (s) => { this.stockSummary = s; this.isLoading = false; },
      error: () => { this.isLoading = false; },
    });
    this.inventoryService.getExpiringItems(7).subscribe((items) => {
      this.expiringItems = items;
    });
    this.requestService.getAll('PENDING' as any).subscribe((reqs) => {
      this.pendingRequests = reqs;
    });
  }

  approveRequest(id: number): void {
    this.requestService.approve(id).subscribe(() => {
      this.notificationService.showToast('Request approved!', 'success');
      this.loadData();
    });
  }

  rejectRequest(id: number): void {
    this.requestService.reject(id, 'Insufficient stock').subscribe(() => {
      this.notificationService.showToast('Request rejected.', 'info');
      this.loadData();
    });
  }

  getStockClass(available: number): string {
    if (available === 0) return 'stock-empty';
    if (available < 5) return 'stock-critical';
    if (available < 15) return 'stock-low';
    return 'stock-ok';
  }

  getUrgencyClass(u: string): string {
    const m: Record<string, string> = { CRITICAL: 'badge-critical', URGENT: 'badge-warning', NORMAL: 'badge-info' };
    return m[u] || 'badge-info';
  }
}
