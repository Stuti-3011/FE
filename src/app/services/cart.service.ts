import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { CartItem } from '../models/cart-item';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'https://localhost:7228/api/Cart';
  private cartCountSubject = new BehaviorSubject<number>(0);

  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  addToCart(productId: number) {
    return this.http.post(this.apiUrl, {
      productId,
      quantity: 1
    }, {
      headers: this.getHeaders(),
      responseType: 'text'
    }).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  getCart() {
    return this.http.get<CartItem[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap((items) => this.updateCartCount(items))
    );
  }

  remove(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
      responseType: 'text'
    }).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  updateQuantity(id: number, quantity: number) {
    return this.http.put(`${this.apiUrl}/${id}`, { quantity }, {
      headers: this.getHeaders(),
      responseType: 'text'
    }).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  refreshCartCount() {
    this.getCart().subscribe({
      error: (err) => console.error('[CartService] Error refreshing cart count:', err)
    });
  }

  private updateCartCount(items: CartItem[]) {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    this.cartCountSubject.next(totalQuantity);
  }
}
