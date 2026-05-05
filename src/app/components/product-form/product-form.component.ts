import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../services/notification.service';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

interface ProductImageSelection {
  file: File;
  preview: string;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnDestroy {
  readonly commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  readonly maxImages = 6;
  readonly productForm;

  customSizeInput = '';
  errorMessage = '';
  primaryImageIndex = 0;
  selectedImages: ProductImageSelection[] = [];
  selectedSizes: string[] = [];

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

  ngOnDestroy(): void {
    this.releasePreviews();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const incomingFiles = Array.from(input.files ?? []);

    if (!incomingFiles.length) {
      return;
    }

    const totalImages = this.selectedImages.length + incomingFiles.length;
    const availableSlots = this.maxImages - this.selectedImages.length;

    if (totalImages > this.maxImages) {
      this.notification.showError(`You can upload up to ${this.maxImages} images`);
    }

    const filesToAdd = incomingFiles.slice(0, Math.max(availableSlots, 0));
    const nextImages = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    this.selectedImages = [...this.selectedImages, ...nextImages];
    input.value = '';
  }

  removeImage(index: number) {
    const [removedImage] = this.selectedImages.splice(index, 1);
    if (removedImage) {
      URL.revokeObjectURL(removedImage.preview);
    }

    if (this.primaryImageIndex >= this.selectedImages.length) {
      this.primaryImageIndex = Math.max(this.selectedImages.length - 1, 0);
    }
  }

  moveImage(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= this.selectedImages.length) {
      return;
    }

    [this.selectedImages[index], this.selectedImages[nextIndex]] = [this.selectedImages[nextIndex], this.selectedImages[index]];

    if (this.primaryImageIndex === index) {
      this.primaryImageIndex = nextIndex;
    } else if (this.primaryImageIndex === nextIndex) {
      this.primaryImageIndex = index;
    }
  }

  setPrimaryImage(index: number) {
    this.primaryImageIndex = index;
  }

  toggleSize(size: string) {
    if (this.selectedSizes.includes(size)) {
      this.selectedSizes = this.selectedSizes.filter((item) => item !== size);
      return;
    }

    this.selectedSizes = [...this.selectedSizes, size];
  }

  addCustomSizes() {
    const customSizes = this.customSizeInput
      .split(',')
      .map((size) => size.trim().toUpperCase())
      .filter(Boolean);

    if (!customSizes.length) {
      return;
    }

    this.selectedSizes = Array.from(new Set([...this.selectedSizes, ...customSizes]));
    this.customSizeInput = '';
  }

  submit() {
    this.errorMessage = '';

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.errorMessage = 'Please enter valid product details';
      this.notification.showError(this.errorMessage);
      return;
    }

    if (!this.selectedImages.length) {
      this.errorMessage = 'At least one product image is required';
      this.notification.showError(this.errorMessage);
      return;
    }

    const product = this.productForm.getRawValue();
    const formData = new FormData();

    formData.append('name', product.name);
    formData.append('price', product.price.toString());
    formData.append('description', product.description || '');
    formData.append('stock', product.stock.toString());
    formData.append('primaryImageIndex', this.primaryImageIndex.toString());

    this.selectedImages.forEach((image) => formData.append('images', image.file));
    this.selectedSizes.forEach((size) => formData.append('sizes', size));

    this.productService.addProduct(formData).subscribe({
      next: () => {
        this.notification.showSuccess('Product added successfully');
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err?.error?.message || 'Failed to add product';
        this.notification.showError(this.errorMessage);
      }
    });
  }

  hasSize(size: string): boolean {
    return this.selectedSizes.includes(size);
  }

  trackByPreview(_: number, image: ProductImageSelection): string {
    return image.preview;
  }

  private releasePreviews() {
    this.selectedImages.forEach((image) => URL.revokeObjectURL(image.preview));
  }
}
