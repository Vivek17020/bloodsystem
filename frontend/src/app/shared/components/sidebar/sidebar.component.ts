import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { User, Role } from '../../../core/models/user.model';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: Role[];
  badge?: string;
  divider?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnChanges {
  @Input() currentUser: User | null = null;

  private readonly ALL_ITEMS: NavItem[] = [
    // Admin-only
    { label: 'Dashboard',       icon: 'dashboard',          route: '/app/dashboard',           roles: [Role.ADMIN] },
    { label: 'User Management', icon: 'manage_accounts',    route: '/app/users',               roles: [Role.ADMIN] },
    { label: 'Analytics',       icon: 'bar_chart',          route: '/app/analytics',           roles: [Role.ADMIN] },

    // Donor-only
    { label: 'My Dashboard',    icon: 'volunteer_activism', route: '/app/donor-dashboard',     roles: [Role.DONOR] },
    { label: 'Appointments',    icon: 'event',              route: '/app/appointments',        roles: [Role.DONOR] },

    // Hospital-only
    { label: 'My Dashboard',    icon: 'local_hospital',     route: '/app/hospital-dashboard',  roles: [Role.HOSPITAL] },

    // Blood Bank-only
    { label: 'My Dashboard',    icon: 'bloodtype',          route: '/app/bloodbank-dashboard', roles: [Role.BLOOD_BANK] },

    // Shared (Admin + Blood Bank)
    { label: 'Inventory',       icon: 'inventory_2',        route: '/app/inventory',           roles: [Role.ADMIN, Role.BLOOD_BANK] },

    // Shared (everyone)
    { label: 'Blood Requests',  icon: 'emergency',          route: '/app/emergency-requests',  roles: [Role.ADMIN, Role.HOSPITAL, Role.BLOOD_BANK, Role.DONOR], divider: true },
    { label: 'Notifications',   icon: 'notifications',      route: '/app/notifications',       roles: [Role.ADMIN, Role.DONOR, Role.HOSPITAL, Role.BLOOD_BANK] },

    // Payments (everyone)
    { label: 'Donations',       icon: 'favorite',           route: '/app/donations',           roles: [Role.ADMIN, Role.DONOR, Role.HOSPITAL, Role.BLOOD_BANK], divider: true },
  ];

  visibleItems: NavItem[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void { this.filterItems(); }
  ngOnChanges(): void { this.filterItems(); }

  filterItems(): void {
    if (!this.currentUser) return;
    this.visibleItems = this.ALL_ITEMS.filter(item =>
      item.roles.includes(this.currentUser!.role)
    );
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}
