import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

// Animations
import { BrowserAnimationsModule as AnimationsModule } from '@angular/platform-browser/animations';

// App
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Interceptors
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';

// Layouts
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

// Auth Module
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/auth/register/register.component';

// Admin Module
import { AdminDashboardComponent } from './modules/admin/admin-dashboard/admin-dashboard.component';
import { AnalyticsPageComponent } from './modules/admin/analytics/analytics-page.component';
import { UserManagementComponent } from './modules/admin/user-management/user-management.component';

// Donor Module
import { DonorDashboardComponent } from './modules/donor/donor-dashboard/donor-dashboard.component';

// Hospital Module
import { HospitalDashboardComponent } from './modules/hospital/hospital-dashboard/hospital-dashboard.component';

// Blood Bank Module
import { BloodbankDashboardComponent } from './modules/bloodbank/bloodbank-dashboard/bloodbank-dashboard.component';

// Feature Modules
import { InventoryPageComponent } from './modules/inventory/inventory-page.component';
import { EmergencyRequestPageComponent } from './modules/emergency-request/emergency-request-page.component';
import { AppointmentsPageComponent } from './modules/appointments/appointments-page.component';
import { NotificationsPageComponent } from './modules/notifications/notifications-page.component';
import { DonationsPageComponent } from './modules/payments/donations-page.component';

// Shared Components
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { BloodTypeChipComponent } from './shared/components/blood-type-chip/blood-type-chip.component';
import { ChatbotComponent } from './shared/components/chatbot/chatbot.component';

const MATERIAL_MODULES = [
  MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule,
  MatButtonModule, MatCardModule, MatTableModule, MatPaginatorModule,
  MatSortModule, MatFormFieldModule, MatInputModule, MatSelectModule,
  MatDialogModule, MatSnackBarModule, MatProgressBarModule, MatProgressSpinnerModule,
  MatChipsModule, MatBadgeModule, MatMenuModule, MatTooltipModule,
  MatTabsModule, MatDatepickerModule, MatNativeDateModule, MatCheckboxModule,
  MatRadioModule, MatStepperModule, MatExpansionModule, MatDividerModule,
  MatAutocompleteModule,
];

@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    AuthLayoutComponent,
    LoginComponent,
    RegisterComponent,
    AdminDashboardComponent,
    AnalyticsPageComponent,
    UserManagementComponent,
    DonorDashboardComponent,
    HospitalDashboardComponent,
    BloodbankDashboardComponent,
    InventoryPageComponent,
    EmergencyRequestPageComponent,
    AppointmentsPageComponent,
    NotificationsPageComponent,
    DonationsPageComponent,
    SidebarComponent,
    NavbarComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    BloodTypeChipComponent,
    ChatbotComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    ...MATERIAL_MODULES,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor,  multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
