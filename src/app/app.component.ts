import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './services/auth.service';
import { MatIconModule } from '@angular/material/icon';   
import { MatBadgeModule } from '@angular/material/badge'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterLink, 
    CommonModule, 
    MatToolbarModule, 
    MatButtonModule,
    MatIconModule,
    MatBadgeModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private auth: AuthService) {
    console.log('[AppComponent] Component initialized');
    console.log('[AppComponent] isLoggedIn:', this.auth.isLoggedIn());
    console.log('[AppComponent] isAdmin:', this.auth.isAdmin());
  }
  showDropdown = false;

  isLoggedIn(): boolean {
    const result = this.auth.isLoggedIn();
    console.log('[AppComponent] isLoggedIn called, returning:', result);
    return result;
  }

  logout(): void {
    console.log('[AppComponent] logout clicked');
    this.auth.logout();
    console.log('[AppComponent] User logged out, redirecting to home');
  }

  isAdmin(): boolean {
    const result = this.auth.isAdmin();
    console.log('[AppComponent] isAdmin called, returning:', result);
    return result;
  }
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  goToProfile() {
    alert('Profile page coming soon');
  }
}
