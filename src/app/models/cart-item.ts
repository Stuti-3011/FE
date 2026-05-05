import { Product } from './product';

export interface CartItem {
  id: number;
  username: string;
  productId: number;
  quantity: number;
  selectedSize?: string | null;
  product: Product;
}
