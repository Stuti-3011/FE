import { Product } from '../models/product';

export const API_BASE_URL = 'https://localhost:7228';
export const PRODUCT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80';

export function resolveImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) {
    return PRODUCT_FALLBACK_IMAGE;
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl}`;
}

export function getProductImages(product?: Product): string[] {
  if (!product) {
    return [PRODUCT_FALLBACK_IMAGE];
  }

  const urls = [
    ...(product.imageUrls ?? []),
    ...splitImageUrls(product.imageUrl)
  ]
    .map((url) => url.trim())
    .filter(Boolean);

  const uniqueUrls = Array.from(new Set(urls));
  return uniqueUrls.length ? uniqueUrls.map(resolveImageUrl) : [PRODUCT_FALLBACK_IMAGE];
}

function splitImageUrls(imageUrl?: string): string[] {
  if (!imageUrl) {
    return [];
  }

  return imageUrl.split(',').map((url) => url.trim());
}
