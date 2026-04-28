import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { WishlistItem } from '../../models/wishlist-item';

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
    private router: Router
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
      },
      error: (err) => {
        console.error('[WishlistComponent] Error removing wishlist item:', err);
      }
    });
  }

  addToCart(productId: number, productName: string) {
    this.cartService.addToCart(productId).subscribe({
      next: () => {
        alert(`${productName} added to cart successfully!`);
      },
      error: (err) => {
        console.error('[WishlistComponent] Error adding wishlist product to cart:', err);
        alert('Unable to add product to cart.');
      }
    });
  }

  openProduct(productId: number) {
    this.router.navigate(['/product', productId]);
  }
}
