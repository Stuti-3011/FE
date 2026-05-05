import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product';
import { WishlistService } from '../../services/wishlist.service';
import { NotificationService } from '../../services/notification.service';
import { getProductImages } from '../../shared/product-images';
import { getProductSizes } from '../../shared/product-sizes';
import { SizeChartDialogComponent } from '../size-chart-dialog/size-chart-dialog.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  availableSizes: string[] = [];
  galleryImages: string[] = [];
  previewImageIndex = 0;
  previewOpen = false;
  product?: Product;
  selectedImage = '';
  selectedSize = '';
  showSizeValidation = false;
  zoomLevel = 1;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private notification: NotificationService,
    private dialog: MatDialog
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
        this.availableSizes = getProductSizes(product);
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

    if (this.availableSizes.length && !this.selectedSize) {
      this.showSizeValidation = true;
      this.notification.showError('Please select a size before adding this product to cart');
      return;
    }

    this.showSizeValidation = false;
    this.cartService.addToCart(this.product.id, this.selectedSize).subscribe({
      next: () => {
        this.notification.showSuccess('Product added to cart');
      },
      error: (err) => {
        console.error('[ProductDetailComponent] Error adding product to cart:', err);
        this.notification.showError(err?.error?.message || 'Unable to add product to cart');
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

  selectSize(size: string) {
    this.selectedSize = size;
    this.showSizeValidation = false;
  }

  openPreview(image: string) {
    this.previewImageIndex = this.galleryImages.indexOf(image);
    this.previewOpen = true;
    this.zoomLevel = 1;
  }

  closePreview() {
    this.previewOpen = false;
    this.zoomLevel = 1;
  }

  previousPreviewImage() {
    if (!this.galleryImages.length) {
      return;
    }

    this.previewImageIndex = (this.previewImageIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
  }

  nextPreviewImage() {
    if (!this.galleryImages.length) {
      return;
    }

    this.previewImageIndex = (this.previewImageIndex + 1) % this.galleryImages.length;
  }

  zoomIn() {
    this.zoomLevel = Math.min(this.zoomLevel + 0.25, 3);
  }

  zoomOut() {
    this.zoomLevel = Math.max(this.zoomLevel - 0.25, 1);
  }

  openSizeChart() {
    this.dialog.open(SizeChartDialogComponent, {
      data: { availableSizes: this.availableSizes }
    });
  }

  get previewImage(): string {
    return this.galleryImages[this.previewImageIndex] ?? this.selectedImage;
  }
}
