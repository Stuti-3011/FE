import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product';
import { WishlistService } from '../../services/wishlist.service';
import { NotificationService } from '../../services/notification.service';
import { getProductImages } from '../../shared/product-images';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  galleryImages: string[] = [];
  selectedImage = '';
  product?: Product;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.loadProduct(id);
    }
  }

  loadProduct(id: number) {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.galleryImages = getProductImages(product);
        this.selectedImage = this.galleryImages[0];
      },
      error: (err) => {
        console.error('[ProductDetailComponent] Error loading product:', err);
      }
    });
  }

  addToCart() {
    if (!this.product?.id) {
      return;
    }

    this.cartService.addToCart(this.product.id).subscribe({
      next: () => {
        this.notification.showSuccess('Product added to cart');
      },
      error: (err) => {
        console.error('[ProductDetailComponent] Error adding product to cart:', err);
        this.notification.showError('Unable to add product to cart');
      }
    });
  }

  addToWishlist() {
    if (!this.product?.id) {
      return;
    }

    this.wishlistService.addToWishlist(this.product.id).subscribe({
      next: () => {
        this.notification.showSuccess('Added to wishlist');
      },
      error: () => {
        this.notification.showError('Unable to add to wishlist');
      }
    });
  }

  selectImage(image: string) {
    this.selectedImage = image;
  }
}
