import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './services/auth.service';
import { MatIconModule } from '@angular/material/icon';   
import { MatBadgeModule } from '@angular/material/badge'; 
import { filter } from 'rxjs';
import { CartService } from './services/cart.service';
import { WishlistService } from './services/wishlist.service';

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
export class AppComponent implements OnInit {
  cartCount = 0;
  wishlistCount = 0;

  constructor(
    private auth: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router
  ) {
    this.cartService.cartCount$.subscribe((count) => {
      this.cartCount = count;
    });

    this.wishlistService.wishlistCount$.subscribe((count) => {
      this.wishlistCount = count;
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.refreshHeaderState();
      });
  }
  showDropdown = false;

  ngOnInit(): void {
    this.refreshHeaderState();
  }

  isLoggedIn(): boolean {
    const result = this.auth.isLoggedIn();
    return result;
  }

  logout(): void {
    this.auth.logout();
    this.refreshHeaderState();
    this.router.navigate(['/products']);
  }

  isAdmin(): boolean {
    const result = this.auth.isAdmin();
    return result;
  }
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  goToProfile() {
    alert('Profile page coming soon');
  }

  private refreshHeaderState() {
    this.cartService.refreshCartCount();
    this.wishlistService.refreshWishlist();
  }
}
