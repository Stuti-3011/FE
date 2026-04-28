import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {

  username = '';
  password = '';
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute,
    private auth: AuthService,
    private notification: NotificationService) {}

  login() {
    this.errorMessage = '';

    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter username and password';
      console.warn('[LoginComponent] Validation failed: missing credentials');
      return;
    }

    this.http.post<any>('https://localhost:7228/api/Auth/login', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
        this.notification.showSuccess('Logged in successfully');
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error('[LoginComponent] Login failed:', err);
        this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
        this.notification.showError('Login failed');
      }
    });
  }
}
