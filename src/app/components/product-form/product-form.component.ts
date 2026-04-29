import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../services/notification.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent {
  productForm;

  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  errorMessage = '';
  readonly maxImages = 6;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private notification: NotificationService
  ) {
    this.productForm = this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      price: [0, [Validators.required, Validators.min(1)]],
      description: [''],
      stock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).slice(0, this.maxImages);

    if ((input.files?.length ?? 0) > this.maxImages) {
      this.notification.showError(`You can upload up to ${this.maxImages} images`);
    }

    this.selectedFiles = files;
    this.imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    this.imagePreviews = files.map((file) => URL.createObjectURL(file));
  }

  submit() {
    this.errorMessage = '';

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.errorMessage = 'Please enter valid product details';
      return;
    }

    const product = this.productForm.getRawValue();
    const formData = new FormData();

    formData.append('name', product.name);
    formData.append('price', product.price.toString());
    formData.append('description', product.description || '');
    formData.append('stock', product.stock.toString());

if (this.selectedFiles.length) {
  formData.append('image', this.selectedFiles[0]);
            this.selectedFiles.slice(1).forEach((file) => formData.append('images', file));
}
    this.productService.addProduct(formData).subscribe({
      next: () => {
        this.notification.showSuccess('Product added successfully');
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to add product';
        this.notification.showError('Failed to add product');
      }
    });
  }
}
