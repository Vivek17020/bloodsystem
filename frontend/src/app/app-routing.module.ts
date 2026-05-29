import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/auth/register/register.component';

// Admin
import { AdminDashboardComponent } from './modules/admin/admin-dashboard/admin-dashboard.component';
import { AnalyticsPageComponent } from './modules/admin/analytics/analytics-page.component';
import { UserManagementComponent } from './modules/admin/user-management/user-management.component';

// Role dashboards
import { DonorDashboardComponent } from './modules/donor/donor-dashboard/donor-dashboard.component';
import { HospitalDashboardComponent } from './modules/hospital/hospital-dashboard/hospital-dashboard.component';
import { BloodbankDashboardComponent } from './modules/bloodbank/bloodbank-dashboard/bloodbank-dashboard.component';

// Feature pages
import { InventoryPageComponent } from './modules/inventory/inventory-page.component';
import { EmergencyRequestPageComponent } from './modules/emergency-request/emergency-request-page.component';
import { AppointmentsPageComponent } from './modules/appointments/appointments-page.component';
import { NotificationsPageComponent } from './modules/notifications/notifications-page.component';
import { DonationsPageComponent } from './modules/payments/donations-page.component';

// Guards
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login',    component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Admin
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'users',
        component: UserManagementComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'analytics',
        component: AnalyticsPageComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
      },

      // Role-specific dashboards
      {
        path: 'donor-dashboard',
        component: DonorDashboardComponent,
        canActivate: [RoleGuard],
        data: { roles: ['DONOR'] },
      },
      {
        path: 'hospital-dashboard',
        component: HospitalDashboardComponent,
        canActivate: [RoleGuard],
        data: { roles: ['HOSPITAL'] },
      },
      {
        path: 'bloodbank-dashboard',
        component: BloodbankDashboardComponent,
        canActivate: [RoleGuard],
        data: { roles: ['BLOOD_BANK'] },
      },

      // Shared features
      {
        path: 'inventory',
        component: InventoryPageComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'BLOOD_BANK'] },
      },
      {
        path: 'emergency-requests',
        component: EmergencyRequestPageComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'appointments',
        component: AppointmentsPageComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'notifications',
        component: NotificationsPageComponent,
        canActivate: [AuthGuard],
      },

      // Payments & Donations
      {
        path: 'donations',
        component: DonationsPageComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
  { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
