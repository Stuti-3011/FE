import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatFormFieldModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'] 
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];

  constructor(private productService: ProductService, private auth: AuthService) {}

  isAdmin(): boolean {
    console.log('[ProductListComponent] isAdmin called, result:', this.auth.isAdmin());
    return this.auth.isAdmin();
  }

  ngOnInit(): void {
    console.log('[ProductListComponent] ngOnInit called, loading products...');
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data) => {
        console.log('[ProductListComponent] Products loaded:', data.length);
        this.products = data;
      },
      error: (err) => {
        console.error('[ProductListComponent] Error loading products:', err);
      }
    });
  }

  delete(id: number) {
    console.log('[ProductListComponent] Delete clicked for id:', id);
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          console.log('[ProductListComponent] Product deleted successfully');
          this.loadProducts();
        },
        error: (err) => {
          console.error('[ProductListComponent] Error deleting product:', err);
        }
      });
    }
  }

  addToCart(product: Product) {
    console.log('[ProductListComponent] Add to cart clicked for product:', product.name);
    alert(`Added ${product.name} to cart!`);
  }
}