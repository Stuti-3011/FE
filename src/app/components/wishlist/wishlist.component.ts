import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { WishlistItem } from '../../models/wishlist-item';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
  wishlistItems: WishlistItem[] = [];

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist() {
    this.wishlistService.getWishlist().subscribe({
      next: (items) => {
        this.wishlistItems = items;
      },
      error: (err) => {
        console.error('[WishlistComponent] Error loading wishlist:', err);
      }
    });
  }

  removeItem(id: number) {
    this.wishlistService.remove(id).subscribe({
      next: () => {
        this.loadWishlist();
        this.notification.showSuccess('Removed from wishlist');
      },
      error: (err) => {
        console.error('[WishlistComponent] Error removing wishlist item:', err);
        this.notification.showError('Unable to remove item');
      }
    });
  }

  addToCart(productId: number, productName: string) {
    this.cartService.addToCart(productId).subscribe({
      next: () => {
        this.notification.showSuccess(`${productName} moved to cart`);
      },
      error: (err) => {
        console.error('[WishlistComponent] Error adding wishlist product to cart:', err);
        this.notification.showError('Unable to move item to cart');
      }
    });
  }

  openProduct(productId: number) {
    this.router.navigate(['/product', productId]);
  }
}
