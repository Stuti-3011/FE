import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

@Component({
  standalone: true,
  imports: [FormsModule, MatCardModule, MatInputModule, MatButtonModule, MatTableModule],
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {

  username = '';
  password = '';

  constructor(private http: HttpClient, private router: Router) {}

login() {
  this.http.post<any>('https://localhost:7228/api/Auth/login', {
    username: this.username,
    password: this.password
  }).subscribe(res => {
    localStorage.setItem('token', res.token);
    this.router.navigate(['/products']);   // 
  });
  }
}