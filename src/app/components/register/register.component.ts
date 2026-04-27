import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  email = '';
  mobile = '';
  password = '';
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  register() {
    console.log('[RegisterComponent] Register clicked');
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    this.http.post('https://localhost:7228/api/Auth/register', {
      email: this.email,
      mobile: this.mobile,
      password: this.password
    }).subscribe({
      next: () => {
        console.log('[RegisterComponent] Registration successful');
        alert('Registered successfully');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('[RegisterComponent] Registration failed:', err);
        this.errorMessage = err.error?.message || 'Registration failed';
      }
    });
  }
}

