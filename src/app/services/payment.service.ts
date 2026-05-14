import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

export interface CreatePaymentOrderResponse {
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  localOrderId: number;
}

export interface VerifyPaymentRequest {
  localOrderId: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  status: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'https://localhost:7228/api/Payment';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  createOrder() {
    return this.http.post<CreatePaymentOrderResponse>(`${this.apiUrl}/create-order`, {}, {
      headers: this.getHeaders()
    });
  }

  verifyPayment(payload: VerifyPaymentRequest) {
    return this.http.post<VerifyPaymentResponse>(`${this.apiUrl}/verify`, payload, {
      headers: this.getHeaders()
    });
  }
}
