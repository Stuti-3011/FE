import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { WishlistItem } from '../models/wishlist-item';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiUrl = 'https://localhost:7228/api/Wishlist';
  private wishlistCountSubject = new BehaviorSubject<number>(0);
  private wishlistItemsSubject = new BehaviorSubject<WishlistItem[]>([]);

  wishlistCount$ = this.wishlistCountSubject.asObservable();
  wishlistItems$ = this.wishlistItemsSubject.asObservable();

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  addToWishlist(productId: number) {
    return this.http.post(this.apiUrl, productId, {
      headers: this.getHeaders(),
      responseType: 'text'
    }).pipe(
      tap(() => this.refreshWishlist())
    );
  }

  getWishlist() {
    return this.http.get<WishlistItem[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap((items) => this.updateWishlistState(items))
    );
  }

  remove(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
      responseType: 'text'
    }).pipe(
      tap(() => this.refreshWishlist())
    );
  }

  refreshWishlist() {
    this.getWishlist().subscribe({
      error: (err) => console.error('[WishlistService] Error refreshing wishlist:', err)
    });
  }

  private updateWishlistState(items: WishlistItem[]) {
    this.wishlistItemsSubject.next(items);
    this.wishlistCountSubject.next(items.length);
  }
}
