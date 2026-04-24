import { Component } from '@angular/core';
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
  imports: [ FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,  
    MatButtonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  email = '';
  mobile = '';
  password = '';

  constructor(private http: HttpClient, private router: Router) {}

  register() {
    this.http.post('https://localhost:7228/api/Auth/register', {
      email: this.email,
      mobile: this.mobile,
      password: this.password
    }).subscribe(() => {
      alert('Registered successfully');
      this.router.navigate(['/login']);
    });
  }

}

