import type { Product, ProductVariant } from '../data/products';

/**
 * Short, plain names for the storefront. The catalogue keeps its long
 * descriptive titles (used by the admin and order records); shoppers see these.
 * Products added later in the admin fall back to their catalogue name.
 */
const DISPLAY: Record<string, { name: string; kind: string }> = {
  'pilot-prera': { name: 'Pilot Prera', kind: 'Fountain pen · Converter included' },
  'pilot-kakuno-madoromi': { name: 'Kakuno Madoromi', kind: 'Fountain pen · Limited edition' },
  'pilot-kakuno-family': { name: 'Kakuno Family', kind: 'Fountain pen' },
  'pilot-iroshizuku-ink': { name: 'Iroshizuku ink', kind: '50 ml bottle' },
  'waterman-ink-bottle': { name: 'Waterman ink', kind: '50 ml bottle' },
  'pilot-con-40': { name: 'Pilot CON-40 converter', kind: 'For Prera and Kakuno' },
};

export function displayName(product: Product): string {
  return DISPLAY[product.id]?.name ?? product.name;
}

export function displayKind(product: Product): string {
  return DISPLAY[product.id]?.kind ?? product.category;
}

export type StockState = 'in' | 'low' | 'out';

/** Variants without a recorded count are treated as in stock. */
export function stockState(variant: ProductVariant): StockState {
  if (typeof variant.stockCount !== 'number') return 'in';
  if (variant.stockCount <= 0) return 'out';
  return variant.stockCount < 3 ? 'low' : 'in';
}

export function stockLabel(variant: ProductVariant): string {
  const state = stockState(variant);
  if (state === 'out') return 'Sold out';
  if (state === 'low') return `Only ${variant.stockCount} left`;
  return typeof variant.stockCount === 'number'
    ? `${variant.stockCount} in stock in Nairobi`
    : 'In stock in Nairobi';
}
