import type { Product } from '../types/store';
import { CORE_SEED_PRODUCTS } from './catalog';

export async function loadFallbackSeedProducts(): Promise<Product[]> {
  try {
    const { DIGIKALA_EXTRA_PRODUCTS } = await import('./digikalaProducts');
    return [...CORE_SEED_PRODUCTS, ...DIGIKALA_EXTRA_PRODUCTS];
  } catch {
    return [...CORE_SEED_PRODUCTS];
  }
}
