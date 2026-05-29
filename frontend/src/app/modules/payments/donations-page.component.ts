import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RazorpayService, PaymentRecord } from '../../core/services/razorpay.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

export interface DonationTier {
  label: string;
  amount: number;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-donations-page',
  templateUrl: './donations-page.component.html',
  styleUrls: ['./donations-page.component.scss'],
})
export class DonationsPageComponent implements OnInit {
  paymentForm!: FormGroup;
  paymentHistory: PaymentRecord[] = [];
  isProcessing = false;
  lastPaymentSuccess = false;
  historyColumns = ['createdAt', 'purpose', 'amount', 'status'];

  tiers: DonationTier[] = [
    { label: 'Basic',     amount: 100,  description: 'Supports 1 blood test kit',    icon: 'favorite_border' },
    { label: 'Support',   amount: 500,  description: 'Funds storage equipment',      icon: 'favorite' },
    { label: 'Champion',  amount: 1000, description: 'Sponsors a blood drive event', icon: 'star' },
    { label: 'Hero',      amount: 2500, description: 'Equips a mobile blood unit',   icon: 'emoji_events' },
  ];

  purposes = [
    'Blood Drive Support',
    'Equipment Purchase',
    'Storage & Refrigeration',
    'Mobile Blood Unit',
    'Awareness Campaign',
    'General Fund',
  ];

  constructor(
    private fb: FormBuilder,
    private razorpayService: RazorpayService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadHistory();
  }

  initForm(): void {
    this.paymentForm = this.fb.group({
      amount:  [500, [Validators.required, Validators.min(1)]],
      purpose: ['General Fund', Validators.required],
      name:    [this.authService.currentUser?.firstName + ' ' + (this.authService.currentUser?.lastName || '')],
      email:   [this.authService.currentUser?.email || ''],
      phone:   [''],
    });
  }

  selectTier(tier: DonationTier): void {
    this.paymentForm.get('amount')?.setValue(tier.amount);
  }

  loadHistory(): void {
    this.razorpayService.getPaymentHistory().subscribe({
      next: (records) => (this.paymentHistory = records),
      error: () => {},
    });
  }

  onPay(): void {
    if (this.paymentForm.invalid) { this.paymentForm.markAllAsTouched(); return; }
    const { amount, purpose, name, email, phone } = this.paymentForm.value;
    this.isProcessing = true;

    // Step 1: create order on backend
    this.razorpayService.createOrder(amount * 100, 'INR', purpose).subscribe({
      next: (order) => {
        this.isProcessing = false;

        // Step 2: open Razorpay checkout
        this.razorpayService.openCheckout({
          order,
          name: 'Blood Management System',
          description: purpose,
          prefillName:    name,
          prefillEmail:   email,
          prefillContact: phone,
          onSuccess: (response) => {
            // Step 3: verify payment
            this.razorpayService.verifyPayment({
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }).subscribe({
              next: (result) => {
                if (result.success) {
                  this.lastPaymentSuccess = true;
                  this.notificationService.showToast(
                    `Thank you! ₹${amount} donated successfully.`, 'success'
                  );
                  this.loadHistory();
                } else {
                  this.notificationService.showToast('Payment verification failed.', 'error');
                }
              },
              error: () => {
                this.notificationService.showToast('Could not verify payment. Contact support.', 'error');
              },
            });
          },
          onDismiss: () => {
            this.notificationService.showToast('Payment cancelled.', 'info');
          },
        });
      },
      error: () => {
        this.isProcessing = false;
        this.notificationService.showToast('Could not create payment order. Try again.', 'error');
      },
    });
  }
}
