import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface SendOtpRequest {
  phoneOrEmail: string;
}

export interface VerifyOtpRequest {
  phoneOrEmail: string;
  otp: string;
  guestCartSessionId?: string;
}

export interface OtpAuthResponse {
  token: string;
  role: string;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://localhost:7228/api/Auth';

  constructor(private http: HttpClient) {}

  private parseTokenPayload(): Record<string, unknown> | null {
    const token = localStorage.getItem('token');

    if (!token) {
      return null;
    }

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  login(token: string, role: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
  }

  sendOtp(payload: SendOtpRequest) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/send-otp`, payload);
  }

  verifyOtp(payload: VerifyOtpRequest) {
    return this.http.post<OtpAuthResponse>(`${this.apiUrl}/verify-otp`, payload);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }

  isLoggedIn(): boolean {
    const payload = this.parseTokenPayload();

    if (!payload) {
      this.logout();
      return false;
    }

    const exp = typeof payload['exp'] === 'number' ? payload['exp'] : null;

    if (!exp) {
      this.logout();
      return false;
    }

    const isExpired = Date.now() >= exp * 1000;

    if (isExpired) {
      this.logout();
      return false;
    }

    return true;
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }

  getToken(): string | null {
    if (!this.isLoggedIn()) {
      return null;
    }

    return localStorage.getItem('token');
  }

  getUsername(): string | null {
    const payload = this.parseTokenPayload();
    return (payload?.['unique_name'] as string) || (payload?.['name'] as string) || (payload?.['sub'] as string) || null;
  }
}
