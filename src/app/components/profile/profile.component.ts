import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AddressService } from '../../services/address.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Address } from '../../models/address';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  username = '';
  addresses: Address[] = [];
  editingAddressId: number | null = null;
  addressForm: Address = {
    recipientName: '',
    phone: '',
    addressLine: '',
    city: '',
    pincode: '',
    isDefault: false
  };

  constructor(
    private addressService: AddressService,
    private auth: AuthService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.username = this.auth.getUsername() ?? 'User';
    this.loadAddresses();
  }

  loadAddresses() {
    this.addressService.getAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
      },
      error: () => {
        this.notification.showError('Unable to load addresses');
      }
    });
  }

  saveAddress() {
    if (!this.addressForm.recipientName || !this.addressForm.phone || !this.addressForm.addressLine || !this.addressForm.city || !this.addressForm.pincode) {
      this.notification.showError('Please complete all address fields');
      return;
    }

    const request = this.editingAddressId
      ? this.addressService.updateAddress(this.editingAddressId, this.addressForm)
      : this.addressService.addAddress(this.addressForm);

    request.subscribe({
      next: () => {
        this.notification.showSuccess(this.editingAddressId ? 'Address updated' : 'Address added');
        this.resetForm();
        this.loadAddresses();
      },
      error: () => {
        this.notification.showError('Unable to save address');
      }
    });
  }

  editAddress(address: Address) {
    this.editingAddressId = address.id ?? null;
    this.addressForm = { ...address };
  }

  setDefault(addressId: number | undefined) {
    if (!addressId) {
      return;
    }

    this.addressService.setDefaultAddress(addressId).subscribe({
      next: () => {
        this.notification.showSuccess('Default address updated');
        this.loadAddresses();
      },
      error: () => {
        this.notification.showError('Unable to update default address');
      }
    });
  }

  resetForm() {
    this.editingAddressId = null;
    this.addressForm = {
      recipientName: '',
      phone: '',
      addressLine: '',
      city: '',
      pincode: '',
      isDefault: false
    };
  }
}
