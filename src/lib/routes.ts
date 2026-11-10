/**
 * Route map for the storefront. Every shopper-facing view has a real URL so
 * pages can be linked, shared and indexed.
 */
export const SERIES_IDS = ['madoromi', 'family', 'prera', 'iroshizuku', 'waterman'] as const;

export type SeriesId = (typeof SERIES_IDS)[number];

export const ROUTES = {
  home: '/',
  range: '/#range',
  inks: '/#inks',
  delivery: '/#delivery',
  wishlist: '/wishlist',
  sets: '/set-builder',
  checkout: '/checkout',
} as const;

/** The old per-series pages now live on the matching product page. */
export const SERIES_PRODUCT_IDS: Record<SeriesId, string> = {
  madoromi: 'pilot-kakuno-madoromi',
  family: 'pilot-kakuno-family',
  prera: 'pilot-prera',
  iroshizuku: 'pilot-iroshizuku-ink',
  waterman: 'waterman-ink-bottle',
};

export function isSeriesId(value: string | undefined): value is SeriesId {
  return !!value && (SERIES_IDS as readonly string[]).includes(value);
}

export function productPath(productId: string): string {
  return `/products/${encodeURIComponent(productId)}`;
}
