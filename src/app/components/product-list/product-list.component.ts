import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { MatIconModule } from '@angular/material/icon';
import { WishlistService } from '../../services/wishlist.service';
import { WishlistItem } from '../../models/wishlist-item';
import { NotificationService } from '../../services/notification.service';
import { ProductFilterService } from '../../services/product-filter.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'] 
})
export class ProductListComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  filteredProducts: Product[] = [];
  maxAvailablePrice = 0;
  maxPrice: number | null = null;
  minPrice: number | null = null;
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
    private router: Router,
    private notification: NotificationService,
    private productFilterService: ProductFilterService
  ) {
    this.productFilterService.searchTerm$.subscribe(() => this.applyFilters());
    this.productFilterService.minPrice$.subscribe((value) => {
      this.minPrice = value;
      this.applyFilters();
    });
    this.productFilterService.maxPrice$.subscribe((value) => {
      this.maxPrice = value;
      this.applyFilters();
    });
  }

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
        this.maxAvailablePrice = data.length ? Math.ceil(Math.max(...data.map((product) => Number(product.price)))) : 0;
        if (this.maxPrice === null) {
          this.maxPrice = this.maxAvailablePrice;
        }
        this.applyFilters();
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
        this.notification.showSuccess('Product added to cart');
      },
      error: (err) => {
        console.error('[ProductListComponent] Error adding product to cart:', err);
        this.notification.showError('Unable to add product to cart');
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
          this.notification.showSuccess('Removed from wishlist');
        },
        error: (err) => {
          console.error('[ProductListComponent] Error removing wishlist item:', err);
          this.notification.showError('Unable to update wishlist');
        }
      });

      return;
    }

    this.wishlistService.addToWishlist(product.id).subscribe({
      next: () => {
        this.loadWishlist();
        this.notification.showSuccess('Added to wishlist');
      },
      error: (err) => {
        console.error('[ProductListComponent] Error adding wishlist item:', err);
        this.notification.showError('Unable to update wishlist');
      }
    });
  }

  updatePriceFilter() {
    this.productFilterService.setPriceRange(this.minPrice, this.maxPrice);
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

  private applyFilters() {
    const filters = this.productFilterService.getCurrentFilters();
    const searchTerm = filters.searchTerm.trim().toLowerCase();

    this.filteredProducts = this.products.filter((product) => {
      const matchesSearch = !searchTerm
        || product.name.toLowerCase().includes(searchTerm)
        || product.description.toLowerCase().includes(searchTerm);
      const matchesMin = filters.minPrice === null || Number(product.price) >= filters.minPrice;
      const matchesMax = filters.maxPrice === null || Number(product.price) <= filters.maxPrice;

      return matchesSearch && matchesMin && matchesMax;
    });
  }
}
