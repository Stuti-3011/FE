import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'https://localhost:7228/api/product';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getProducts() {
    return this.http.get<Product[]>(this.apiUrl);
    // return this.http.get<Product[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getProductById(id: number) {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  addProduct(formData: FormData) {
  return this.http.post(this.apiUrl, formData);
}

  deleteProduct(id: number) {
  return this.http.delete(`${this.apiUrl}/${id}`);  
}
}
