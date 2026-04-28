import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];

  constructor(
    private cartService: CartService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart() {
    this.cartService.getCart().subscribe({
      next: (items) => {
        this.cartItems = items;
      },
      error: (err) => {
        console.error('[CartComponent] Error loading cart:', err);
      }
    });
  }

  removeItem(id: number) {
    this.cartService.remove(id).subscribe({
      next: () => {
        this.loadCart();
        this.notification.showSuccess('Item removed from cart');
      },
      error: (err) => {
        console.error('[CartComponent] Error removing cart item:', err);
        this.notification.showError('Unable to remove item');
      }
    });
  }

  getTotalAmount(): number {
    return this.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  changeQuantity(item: CartItem, change: number) {
    const quantity = item.quantity + change;

    if (quantity < 1) {
      return;
    }

    this.cartService.updateQuantity(item.id, quantity).subscribe({
      next: () => {
        item.quantity = quantity;
      },
      error: () => {
        this.notification.showError('Unable to update quantity');
      }
    });
  }

  getSubtotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }
}
