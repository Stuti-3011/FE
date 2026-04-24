import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatInputModule, MatButtonModule, MatTableModule],
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent {

  product: Product = {
    name: '',
    price: 0,
    description: '',
    stock: 0
  };

  constructor(private productService: ProductService, private router: Router) {}
  addProduct() {
  this.productService.addProduct(this.product).subscribe(() => {
    alert('Product Added');
    this.router.navigate(['/products']); 
  });
}
  submit() {
    this.productService.addProduct(this.product).subscribe(() => {
      alert('Product Added');
    });
  }
}