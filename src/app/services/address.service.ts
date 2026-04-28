import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Address } from '../models/address';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = 'https://localhost:7228/api/Address';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  getAddresses() {
    return this.http.get<Address[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  addAddress(address: Address) {
    return this.http.post<Address>(this.apiUrl, address, { headers: this.getHeaders() });
  }

  updateAddress(id: number, address: Address) {
    return this.http.put<Address>(`${this.apiUrl}/${id}`, address, { headers: this.getHeaders() });
  }

  setDefaultAddress(id: number) {
    return this.http.put(`${this.apiUrl}/${id}/default`, {}, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }
}
