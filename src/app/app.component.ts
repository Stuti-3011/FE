import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './services/auth.service';
import { MatIconModule } from '@angular/material/icon';   
import { MatBadgeModule } from '@angular/material/badge'; 
import { filter } from 'rxjs';
import { CartService } from './services/cart.service';
import { WishlistService } from './services/wishlist.service';
import { ProductFilterService } from './services/product-filter.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterLink, 
    CommonModule, 
    FormsModule,
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
  searchTerm = '';
  wishlistCount = 0;

  constructor(
    private auth: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router,
    private productFilterService: ProductFilterService,
    private notification: NotificationService
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
    this.notification.showSuccess('Logged out successfully');
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
    this.showDropdown = false;
    this.router.navigate(['/profile']);
  }

  onSearchChange() {
    this.productFilterService.setSearchTerm(this.searchTerm);
  }

  private refreshHeaderState() {
    this.cartService.refreshCartCount();
    this.wishlistService.refreshWishlist();
  }
}
