/**
 * Resolves any local `/assets/...` or `/src/assets/...` image path to a clean
 * static `/assets/...` URL served directly from `public/assets/`, with lazy
 * on-error fallback to `embeddedAssets` if a static asset ever fails to load.
 */
export function resolveAssetUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Redirect any legacy cached Pilot 30ml generated image paths to the Penzorama photo
  if (trimmed.includes('pilot_30ml_')) {
    if (trimmed.includes('black_box')) {
      return '/assets/images/penzorama_pilot_30ml_black.jpg';
    }
    if (trimmed.includes('blue_black')) {
      return '/assets/images/penzorama_pilot_30ml_blue_black.jpg';
    }
    return '/assets/images/penzorama_pilot_30ml_blue.jpg';
  }

  // Normalize `/src/assets/...` or `src/assets/...` to `/assets/...`
  if (trimmed.startsWith('/src/assets/')) {
    return trimmed.replace('/src/assets/', '/assets/');
  }
  if (trimmed.startsWith('src/assets/')) {
    return `/${trimmed.replace('src/assets/', 'assets/')}`;
  }

  // Normalize relative `assets/...` or `./assets/...` to `/assets/...`
  if (trimmed.startsWith('./assets/')) {
    return trimmed.slice(1);
  }
  if (trimmed.startsWith('assets/')) {
    return `/${trimmed}`;
  }

  return trimmed;
}

let embeddedAssetsPromise: Promise<Record<string, string>> | null = null;

function loadEmbeddedAssetsFallback(): Promise<Record<string, string>> {
  if (!embeddedAssetsPromise) {
    embeddedAssetsPromise = import('../data/embeddedAssets')
      .then((mod) => mod.EMBEDDED_ASSETS || {})
      .catch(() => ({}));
  }
  return embeddedAssetsPromise;
}

/**
 * Installs a lightweight capture-phase error listener so that if any `<img>`
 * element fails to load a static file, it first normalizes `/src/assets/`
 * paths and, if needed, lazy-loads the embedded base64 fallback dictionary.
 */
export function installGlobalAssetInterceptor(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener(
    'error',
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;
      const rawAttr = target.getAttribute('src') || target.src;
      if (!rawAttr || rawAttr.startsWith('data:')) return;

      const normalized = resolveAssetUrl(rawAttr);
      if (normalized && normalized !== rawAttr && target.dataset.retriedNormalized !== '1') {
        target.dataset.retriedNormalized = '1';
        target.src = normalized;
        return;
      }

      if (target.dataset.retriedEmbedded === '1') return;
      target.dataset.retriedEmbedded = '1';

      void loadEmbeddedAssetsFallback().then((assets) => {
        let pathname = normalized;
        if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
          try {
            pathname = new URL(normalized).pathname;
          } catch {
            pathname = normalized;
          }
        }
        const match =
          assets[pathname] ||
          assets[rawAttr] ||
          assets[`/src${pathname}`];
        if (match) {
          target.src = match;
        }
      });
    },
    true
  );
}
