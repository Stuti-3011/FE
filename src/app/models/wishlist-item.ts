import { Product } from './product';

export interface WishlistItem {
  id: number;
  username: string;
  productId: number;
  product: Product;
}
