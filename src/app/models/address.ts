export interface Address {
  id?: number;
  userId?: number;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}
