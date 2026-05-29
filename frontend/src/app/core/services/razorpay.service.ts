import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface PaymentVerification {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentRecord {
  id: number;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  purpose: string;
  createdAt: string;
}

declare var Razorpay: any;

@Injectable({ providedIn: 'root' })
export class RazorpayService {
  private readonly apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  /** Creates a Razorpay order on the backend */
  createOrder(amount: number, currency: string, purpose: string): Observable<RazorpayOrder> {
    return this.http.post<RazorpayOrder>(`${this.apiUrl}/create-order`, {
      amount,
      currency,
      purpose,
    });
  }

  /** Verifies payment signature on the backend */
  verifyPayment(payload: PaymentVerification): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/verify`, payload
    );
  }

  /** Gets payment history for current user */
  getPaymentHistory(): Observable<PaymentRecord[]> {
    return this.http.get<PaymentRecord[]>(`${this.apiUrl}/history`);
  }

  /**
   * Opens the Razorpay checkout dialog.
   * The Razorpay script must be loaded in index.html.
   */
  openCheckout(options: {
    order: RazorpayOrder;
    name: string;
    description: string;
    prefillName?: string;
    prefillEmail?: string;
    prefillContact?: string;
    onSuccess: (response: any) => void;
    onDismiss?: () => void;
  }): void {
    const rzpOptions = {
      key: environment.razorpayKeyId,
      amount: options.order.amount,
      currency: options.order.currency,
      name: 'Blood Management System',
      description: options.description,
      order_id: options.order.id,
      prefill: {
        name:    options.prefillName    || '',
        email:   options.prefillEmail   || '',
        contact: options.prefillContact || '',
      },
      theme: { color: '#c62828' },
      handler: (response: any) => options.onSuccess(response),
      modal: {
        ondismiss: () => options.onDismiss?.(),
      },
    };

    const rzp = new Razorpay(rzpOptions);
    rzp.open();
  }
}
