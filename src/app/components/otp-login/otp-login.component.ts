import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-otp-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './otp-login.component.html',
  styleUrl: './otp-login.component.css'
})
export class OtpLoginComponent implements OnDestroy {
  phoneOrEmail = '';
  otp = '';
  errorMessage = '';
  otpSent = false;
  isSendingOtp = false;
  isVerifyingOtp = false;
  resendCountdown = 0;
  private resendTimerId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private auth: AuthService,
    private cartService: CartService,
    private notification: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  sendOtp() {
    this.errorMessage = '';

    if (!this.phoneOrEmail.trim()) {
      this.errorMessage = 'Please enter your phone number or email';
      return;
    }

    if (this.isSendingOtp || this.resendCountdown > 0) {
      return;
    }

    this.isSendingOtp = true;

    this.auth.sendOtp({ phoneOrEmail: this.phoneOrEmail }).subscribe({
      next: (response) => {
        this.isSendingOtp = false;
        this.otpSent = true;
        this.startResendTimer();
        this.notification.showSuccess(response.message || 'OTP sent successfully');
      },
      error: (err) => {
        this.isSendingOtp = false;
        this.errorMessage = err.error?.message || 'Unable to send OTP';
        this.notification.showError(this.errorMessage);
      }
    });
  }

  verifyOtp() {
    this.errorMessage = '';

    if (!this.otpSent) {
      this.errorMessage = 'Please request an OTP first';
      return;
    }

    if (!this.otp.trim()) {
      this.errorMessage = 'Please enter the OTP';
      return;
    }

    if (this.isVerifyingOtp) {
      return;
    }

    this.isVerifyingOtp = true;

    this.auth.verifyOtp({
      phoneOrEmail: this.phoneOrEmail,
      otp: this.otp,
      guestCartSessionId: this.cartService.getGuestCartSessionId()
    }).subscribe({
      next: (response) => {
        this.isVerifyingOtp = false;
        this.auth.login(response.token, response.role);
        this.cartService.refreshCartCount();
        this.notification.showSuccess('Logged in successfully');
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl || '/products');
      },
      error: (err) => {
        this.isVerifyingOtp = false;
        this.errorMessage = err.error?.message || 'OTP verification failed';
        this.notification.showError(this.errorMessage);
      }
    });
  }

  resendOtp() {
    if (this.resendCountdown > 0 || this.isSendingOtp) {
      return;
    }

    this.sendOtp();
  }

  ngOnDestroy(): void {
    if (this.resendTimerId) {
      clearInterval(this.resendTimerId);
    }
  }

  private startResendTimer() {
    this.resendCountdown = 60;

    if (this.resendTimerId) {
      clearInterval(this.resendTimerId);
    }

    this.resendTimerId = setInterval(() => {
      this.resendCountdown--;

      if (this.resendCountdown <= 0 && this.resendTimerId) {
        clearInterval(this.resendTimerId);
        this.resendTimerId = null;
      }
    }, 1000);
  }
}
