import { IMAGE_THUMBS } from '../data/imageThumbs';

export type AssetSize = 'small' | 'thumb' | 'full';

const THUMB_FOLDERS = { small: '/assets/thumbs-small/', thumb: '/assets/thumbs/' } as const;

/** Older catalogue records point at the pre-build source folder; the files are served from /assets. */
function normaliseAssetPath(url: string): string {
  let path = url;

  // Full URLs on our own origin (e.g. https://shop.example/assets/...) reduce to their path.
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const parsed = new URL(path);
      if (typeof window === 'undefined' || parsed.origin !== window.location.origin) {
        return url;
      }
      path = parsed.pathname;
    } catch {
      return url;
    }
  }

  if (path.startsWith('./')) path = path.slice(1);
  if (path.startsWith('assets/') || path.startsWith('src/assets/')) path = `/${path}`;
  if (path.startsWith('/src/assets/')) path = path.slice('/src'.length);
  return path;
}

/**
 * Resolves a catalogue image reference to the URL the browser should load.
 *
 * Local `/assets/...` images are served as static files. By default the 720px
 * thumbnail is returned, which suits cards and galleries. Pass `'small'` for
 * the 200px version used in thumbnail strips and search results, or `'full'`
 * for zoom views that need the full-resolution file. External URLs
 * and data URIs (for example images entered in the merchant admin) pass through.
 */
export function resolveAssetUrl(url?: string | null, size: AssetSize = 'thumb'): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  const path = normaliseAssetPath(trimmed);
  if (size !== 'full' && IMAGE_THUMBS.has(path)) {
    return path.replace(/^\/assets\//, THUMB_FOLDERS[size]);
  }
  return path;
}
