export interface ProductImage {
  id?: number;
  productId?: number;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductSize {
  id?: number;
  productId?: number;
  size: string;
  displayOrder: number;
}

export interface Product {
  id?: number;
  name: string;
  price: number;
  description: string;
  stock: number;
  imageUrl?: string;
  imageUrls?: string[];
  productImages?: ProductImage[];
  sizes?: ProductSize[];
}
