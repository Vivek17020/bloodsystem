import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  hidePassword = true;

  roles = [
    { value: Role.DONOR, label: 'Blood Donor', icon: 'volunteer_activism' },
    { value: Role.HOSPITAL, label: 'Hospital', icon: 'local_hospital' },
    { value: Role.BLOOD_BANK, label: 'Blood Bank', icon: 'bloodtype' },
  ];

  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName:  ['', [Validators.required]],
      lastName:   ['', [Validators.required]],
      username:   ['', [Validators.required, Validators.minLength(3)]],
      email:      ['', [Validators.required, Validators.email]],
      password:   ['', [Validators.required, Validators.minLength(6)]],
      role:       [Role.DONOR, [Validators.required]],
      phone:      [''],
      bloodType:  [''],
      organizationName: [''],
    });
  }

  get selectedRole(): Role { return this.registerForm.get('role')!.value; }
  get isDonor(): boolean { return this.selectedRole === Role.DONOR; }
  get isOrg(): boolean { return this.selectedRole === Role.HOSPITAL || this.selectedRole === Role.BLOOD_BANK; }

  onSubmit(): void {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    this.isLoading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.notificationService.showToast('Account created! Please log in.', 'success');
        this.router.navigate(['/login']);
      },
      error: () => { this.isLoading = false; },
    });
  }
}
