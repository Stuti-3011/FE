import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent {

  product: Product = {
    name: '',
    price: 0,
    description: '',
    stock: 0,
    imageUrl: ''
  };

  selectedFile!: File;
  errorMessage = '';

  constructor(private productService: ProductService, private router: Router) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    console.log('[ProductFormComponent] File selected:', this.selectedFile);
  }

  submit() {
    console.log('[ProductFormComponent] Submit clicked, product:', this.product);
    this.errorMessage = '';

    if (!this.product.name || !this.product.price) {
      this.errorMessage = 'Please enter product name and price';
      console.warn('[ProductFormComponent] Validation failed');
      return;
    }

    const formData = new FormData();

    formData.append('name', this.product.name);
    formData.append('price', this.product.price.toString());
    formData.append('description', this.product.description || '');
    formData.append('stock', this.product.stock.toString());

    // IMAGE FILE
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.productService.addProduct(formData).subscribe({
      next: () => {
        alert('Product Added');
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to add product';
      }
    });
  }
}