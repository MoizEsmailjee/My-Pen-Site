/**
 * Route map for the storefront. Every shopper-facing view has a real URL so
 * pages can be linked, shared and indexed.
 */
export const SERIES_IDS = ['madoromi', 'family', 'prera', 'iroshizuku', 'waterman'] as const;

export type SeriesId = (typeof SERIES_IDS)[number];
export type SeriesView = 'all' | SeriesId | 'wishlist';

export const ROUTES = {
  home: '/',
  collection: '/#collection',
  wishlist: '/wishlist',
  setBuilder: '/set-builder',
  checkout: '/checkout',
} as const;

export function isSeriesId(value: string | undefined): value is SeriesId {
  return !!value && (SERIES_IDS as readonly string[]).includes(value);
}

export function seriesPath(view: SeriesView): string {
  if (view === 'all') return ROUTES.collection;
  if (view === 'wishlist') return ROUTES.wishlist;
  return `/collection/${view}`;
}

export function productPath(productId: string): string {
  return `/products/${encodeURIComponent(productId)}`;
}

/** Which series tab is active for a given pathname (used to highlight the switcher). */
export function seriesViewFromPath(pathname: string): SeriesView | null {
  if (pathname === '/') return 'all';
  if (pathname === ROUTES.wishlist) return 'wishlist';
  const match = pathname.match(/^\/collection\/([\w-]+)\/?$/);
  return match && isSeriesId(match[1]) ? match[1] : null;
}
