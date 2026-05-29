import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { UserManagementService, UserSummary } from '../../../core/services/user-management.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<UserSummary>();
  displayedColumns = ['id', 'username', 'email', 'firstName', 'role', 'enabled', 'createdAt', 'actions'];
  showCreateForm = false;
  isSubmitting = false;
  searchText = '';
  selectedRoleFilter = '';
  editingUserId: number | null = null;

  createForm!: FormGroup;
  roles = Object.values(Role);

  constructor(
    private userService: UserManagementService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data, filter) => {
      const f = filter.toLowerCase();
      return (
        data.username.toLowerCase().includes(f) ||
        data.email.toLowerCase().includes(f) ||
        (data.firstName + ' ' + data.lastName).toLowerCase().includes(f) ||
        data.role.toLowerCase().includes(f)
      );
    };
  }

  initForm(): void {
    this.createForm = this.fb.group({
      username:  ['', [Validators.required, Validators.minLength(3)]],
      email:     ['', [Validators.required, Validators.email]],
      password:  ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', Validators.required],
      lastName:  ['', Validators.required],
      phone:     [''],
      role:      [Role.DONOR, Validators.required],
      bloodType: [''],
      organizationName: [''],
    });
  }

  loadUsers(): void {
    this.userService.getAll().subscribe((users) => {
      this.dataSource.data = users;
    });
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchText.trim().toLowerCase();
  }

  applyRoleFilter(): void {
    if (this.selectedRoleFilter) {
      this.dataSource.filter = this.selectedRoleFilter.toLowerCase();
    } else {
      this.dataSource.filter = this.searchText.trim().toLowerCase();
    }
  }

  onCreate(): void {
    if (this.createForm.invalid) { this.createForm.markAllAsTouched(); return; }
    this.isSubmitting = true;
    this.userService.create(this.createForm.value).subscribe({
      next: () => {
        this.notificationService.showToast('User created successfully!', 'success');
        this.showCreateForm = false;
        this.loadUsers();
        this.isSubmitting = false;
        this.initForm();
      },
      error: () => { this.isSubmitting = false; },
    });
  }

  toggleEnable(user: UserSummary): void {
    const action$ = user.enabled
      ? this.userService.deactivate(user.id)
      : this.userService.activate(user.id);
    action$.subscribe(() => {
      const msg = user.enabled ? 'User deactivated.' : 'User activated.';
      this.notificationService.showToast(msg, 'info');
      user.enabled = !user.enabled;
    });
  }

  changeRole(user: UserSummary, newRole: string): void {
    this.userService.changeRole(user.id, newRole).subscribe(() => {
      this.notificationService.showToast('Role updated.', 'success');
      user.role = newRole as Role;
    });
  }

  deleteUser(id: number): void {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return;
    this.userService.delete(id).subscribe(() => {
      this.notificationService.showToast('User deleted.', 'info');
      this.loadUsers();
    });
  }

  getRoleColor(role: string): string {
    const m: Record<string, string> = {
      ADMIN: '#c62828', DONOR: '#2e7d32', HOSPITAL: '#0277bd', BLOOD_BANK: '#6a1b9a',
    };
    return m[role] || '#555';
  }

  get needsBloodType(): boolean {
    return this.createForm.get('role')?.value === Role.DONOR;
  }

  get needsOrg(): boolean {
    const r = this.createForm.get('role')?.value;
    return r === Role.HOSPITAL || r === Role.BLOOD_BANK;
  }

  get stats(): Record<string, number> {
    const users = this.dataSource.data;
    return {
      total:      users.length,
      active:     users.filter(u => u.enabled).length,
      admin:      users.filter(u => u.role === 'ADMIN').length,
      donor:      users.filter(u => u.role === 'DONOR').length,
      hospital:   users.filter(u => u.role === 'HOSPITAL').length,
      bloodBank:  users.filter(u => u.role === 'BLOOD_BANK').length,
    };
  }
}
