import { Component, OnInit } from '@angular/core';
import { DonorService } from '../../../core/services/donor.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { BloodRequestService } from '../../../core/services/blood-request.service';
import { Donor, DonationHistory } from '../../../shared/models/donor.model';
import { Appointment } from '../../../shared/models/appointment.model';

@Component({
  selector: 'app-donor-dashboard',
  templateUrl: './donor-dashboard.component.html',
  styleUrls: ['./donor-dashboard.component.scss'],
})
export class DonorDashboardComponent implements OnInit {
  donor: Donor | null = null;
  donationHistory: DonationHistory[] = [];
  upcomingAppointments: Appointment[] = [];
  isLoading = true;

  historyColumns = ['donationDate', 'bloodType', 'units', 'bloodBankName', 'status'];

  constructor(
    private donorService: DonorService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.donorService.getMyProfile().subscribe({
      next: (donor) => {
        this.donor = donor;
        this.isLoading = false;
        this.donorService.getDonationHistory(donor.id).subscribe((h) => {
          this.donationHistory = h;
        });
      },
      error: () => { this.isLoading = false; },
    });
    this.appointmentService.getUpcoming().subscribe((appts) => {
      this.upcomingAppointments = appts.slice(0, 3);
    });
  }

  getDaysUntilEligible(): number {
    if (!this.donor?.nextEligibleDate) return 0;
    const today = new Date();
    const next = new Date(this.donor.nextEligibleDate);
    return Math.max(0, Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  }
}
