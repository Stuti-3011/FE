import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item';
import { NotificationService } from '../../services/notification.service';
import { getProductImages } from '../../shared/product-images';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: {
        error?: {
          description?: string;
          metadata?: {
            order_id?: string;
            payment_id?: string;
          };
        };
      }) => void) => void;
    };
  }
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  isProcessingCheckout = false;

  constructor(
    private cartService: CartService,
    private notification: NotificationService,
    private auth: AuthService,
    private paymentService: PaymentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCart();

    const shouldResumeCheckout = this.route.snapshot.queryParamMap.get('checkout') === 'true';

    if (shouldResumeCheckout && this.auth.isLoggedIn()) {
      setTimeout(() => {
        this.proceedToCheckout();
      }, 0);
    }
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

  getImage(item: CartItem): string {
    return getProductImages(item.product)[0];
  }

  proceedToCheckout() {
    if (this.isProcessingCheckout) {
      return;
    }

    if (!this.auth.isLoggedIn()) {
      this.notification.showError('Please continue with OTP to complete checkout');
      this.router.navigate(['/otp-login'], {
        queryParams: { returnUrl: '/cart?checkout=true' }
      });
      return;
    }

    if (!this.cartItems.length) {
      this.notification.showError('Your cart is empty');
      return;
    }

    if (this.route.snapshot.queryParamMap.get('checkout') === 'true') {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { checkout: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }

    if (typeof window.Razorpay === 'undefined') {
      this.notification.showError('Payment gateway is unavailable right now');
      return;
    }

    this.isProcessingCheckout = true;

    this.paymentService.createOrder().subscribe({
      next: (response) => {
        const options = {
          key: response.keyId,
          amount: response.amount,
          currency: 'INR',
          name: 'E-Commerce',
          description: 'Cart Checkout',
          order_id: response.razorpayOrderId,
          prefill: {
            name: this.auth.getUsername() ?? ''
          },
          theme: {
            color: '#0f766e'
          },
          handler: (paymentResponse: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            this.verifyPayment({
              localOrderId: response.localOrderId,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpaySignature: paymentResponse.razorpay_signature
            });
          },
          modal: {
            ondismiss: () => {
              this.isProcessingCheckout = false;
              this.notification.showError('Payment was cancelled');
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', (paymentError: {
          error?: {
            description?: string;
            metadata?: {
              order_id?: string;
              payment_id?: string;
            };
          };
        }) => {
          this.isProcessingCheckout = false;
          this.notification.showError(paymentError.error?.description || 'Payment failed');

          const orderId = paymentError.error?.metadata?.order_id;
          const paymentId = paymentError.error?.metadata?.payment_id;

          if (orderId && paymentId) {
            this.verifyPayment({
              localOrderId: response.localOrderId,
              razorpayPaymentId: paymentId,
              razorpayOrderId: orderId,
              razorpaySignature: ''
            });
            return;
          }

          this.router.navigate(['/order-failure']);
        });
        razorpay.open();
      },
      error: (err) => {
        this.isProcessingCheckout = false;

        if (err.status === 401) {
          this.notification.showError('Your session has expired. Please log in again.');
          this.router.navigate(['/otp-login'], {
            queryParams: { returnUrl: '/cart?checkout=true' }
          });
          return;
        }

        this.notification.showError(err.error?.message || 'Unable to start checkout');
      }
    });
  }

  private verifyPayment(payload: {
    localOrderId: number;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
  }) {
    this.paymentService.verifyPayment(payload).subscribe({
      next: (result) => {
        this.isProcessingCheckout = false;

        if (result.success) {
          this.notification.showSuccess('Payment successful');
          this.cartItems = [];
          this.cartService.refreshCartCount();
          setTimeout(() => {
            this.router.navigate(['/order-success']);
          }, 2000);
          return;
        }

        this.notification.showError(result.message || 'Payment verification failed');
        this.router.navigate(['/order-failure']);
      },
      error: (err) => {
        this.isProcessingCheckout = false;
        this.notification.showError(err.error?.message || 'Unable to verify payment');
        this.router.navigate(['/order-failure']);
      }
    });
  }
}
