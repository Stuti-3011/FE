import { Product } from '../models/product';

export function getProductSizes(product?: Product): string[] {
  return [...(product?.sizes ?? [])]
    .sort((first, second) => first.displayOrder - second.displayOrder)
    .map((item) => item.size?.trim())
    .filter((size): size is string => Boolean(size));
}
