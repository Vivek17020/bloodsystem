import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BloodInventoryService } from '../../core/services/blood-inventory.service';
import { NotificationService } from '../../core/services/notification.service';
import { BloodInventory, InventoryStatus } from '../../shared/models/blood-inventory.model';

@Component({
  selector: 'app-inventory-page',
  templateUrl: './inventory-page.component.html',
  styleUrls: ['./inventory-page.component.scss'],
})
export class InventoryPageComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<BloodInventory>();
  displayedColumns = ['bloodType', 'units', 'collectionDate', 'expiryDate', 'status', 'bloodBankName', 'actions'];
  showForm = false;
  isSubmitting = false;
  addForm!: FormGroup;
  searchText = '';

  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  statuses = Object.values(InventoryStatus);

  constructor(
    private inventoryService: BloodInventoryService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadInventory();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initForm(): void {
    this.addForm = this.fb.group({
      bloodType:      ['', Validators.required],
      units:          [1, [Validators.required, Validators.min(1)]],
      collectionDate: ['', Validators.required],
      expiryDate:     ['', Validators.required],
      notes:          [''],
    });
  }

  loadInventory(): void {
    this.inventoryService.getAll().subscribe((items) => {
      this.dataSource.data = items;
    });
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchText.trim().toLowerCase();
  }

  onSubmit(): void {
    if (this.addForm.invalid) { this.addForm.markAllAsTouched(); return; }
    this.isSubmitting = true;
    this.inventoryService.create(this.addForm.value).subscribe({
      next: () => {
        this.notificationService.showToast('Inventory item added!', 'success');
        this.loadInventory();
        this.showForm = false;
        this.isSubmitting = false;
        this.initForm();
      },
      error: () => { this.isSubmitting = false; },
    });
  }

  deleteItem(id: number): void {
    if (!confirm('Delete this inventory item?')) return;
    this.inventoryService.delete(id).subscribe(() => {
      this.notificationService.showToast('Item deleted.', 'info');
      this.loadInventory();
    });
  }

  getStatusClass(s: string): string {
    const m: Record<string, string> = {
      AVAILABLE: 'badge-success', RESERVED: 'badge-info',
      EXPIRED: 'badge-critical', USED: 'badge-info', DISCARDED: 'badge-critical',
    };
    return m[s] || 'badge-info';
  }

  isExpiringSoon(expiryDate: string): boolean {
    const exp = new Date(expiryDate);
    const now = new Date();
    const days = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return days <= 7 && days > 0;
  }
}
