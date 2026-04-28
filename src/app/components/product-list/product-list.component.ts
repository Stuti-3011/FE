import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { MatIconModule } from '@angular/material/icon';
import { WishlistService } from '../../services/wishlist.service';
import { WishlistItem } from '../../models/wishlist-item';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatIconModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'] 
})
export class ProductListComponent implements OnInit {
  currentSlide = 0;
  products: Product[] = [];
  wishlistItems: WishlistItem[] = [];
  heroSlides = [
    {
      tag: 'Fresh arrivals',
      title: 'Find everyday picks with a sharper storefront feel.',
      copy: 'Curated essentials, standout deals, and clean product discovery in one place.'
    },
    {
      tag: 'Weekend deals',
      title: 'Save more on the products people are adding right now.',
      copy: 'Discover limited-time pricing, trending categories, and fast add-to-cart moments.'
    },
    {
      tag: 'Home favorites',
      title: 'Upgrade your space with simple, useful, feel-good buys.',
      copy: 'Browse polished finds for work, home, and daily living with a smoother shopping flow.'
    }
  ];
  private slideIntervalId?: ReturnType<typeof setInterval>;

  constructor(
    private productService: ProductService,
    private auth: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router
  ) {}

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadWishlist();
    this.startSlider();
  }

  ngOnDestroy(): void {
    if (this.slideIntervalId) {
      clearInterval(this.slideIntervalId);
    }
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        console.error('[ProductListComponent] Error loading products:', err);
      }
    });
  }

  delete(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (err) => {
          console.error('[ProductListComponent] Error deleting product:', err);
        }
      });
    }
  }

  openProduct(productId: number | undefined) {
    if (!productId) {
      return;
    }

    this.router.navigate(['/product', productId]);
  }

  addToCart(product: Product, event?: Event) {
    event?.stopPropagation();
    if (!product.id) {
      console.error('[ProductListComponent] Product id is missing');
      return;
    }

    this.cartService.addToCart(product.id).subscribe({
      next: () => {
        alert(`${product.name} added to cart successfully!`);
      },
      error: (err) => {
        console.error('[ProductListComponent] Error adding product to cart:', err);
        alert('Unable to add product to cart.');
      }
    });
  }

  loadWishlist() {
    this.wishlistService.getWishlist().subscribe({
      next: (items) => {
        this.wishlistItems = items;
      },
      error: (err) => {
        console.error('[ProductListComponent] Error loading wishlist:', err);
      }
    });
  }

  isWishlisted(productId: number | undefined): boolean {
    if (!productId) {
      return false;
    }

    return this.wishlistItems.some((item) => item.productId === productId);
  }

  toggleWishlist(product: Product, event: Event) {
    event.stopPropagation();

    if (!product.id) {
      return;
    }

    const existingItem = this.wishlistItems.find((item) => item.productId === product.id);

    if (existingItem) {
      this.wishlistService.remove(existingItem.id).subscribe({
        next: () => {
          this.loadWishlist();
        },
        error: (err) => {
          console.error('[ProductListComponent] Error removing wishlist item:', err);
        }
      });

      return;
    }

    this.wishlistService.addToWishlist(product.id).subscribe({
      next: () => {
        this.loadWishlist();
      },
      error: (err) => {
        console.error('[ProductListComponent] Error adding wishlist item:', err);
      }
    });
  }

  setSlide(index: number) {
    this.currentSlide = index;
    this.restartSlider();
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
  }

  previousSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.heroSlides.length) % this.heroSlides.length;
    this.restartSlider();
  }

  private startSlider() {
    this.slideIntervalId = setInterval(() => {
      this.nextSlide();
    }, 4500);
  }

  private restartSlider() {
    if (this.slideIntervalId) {
      clearInterval(this.slideIntervalId);
    }

    this.startSlider();
  }
}
