import { EMBEDDED_ASSETS } from '../data/embeddedAssets';

/**
 * Resolves any local `/assets/...` or `/src/assets/...` image path to its
 * self-contained base64 Data URI embedded in the TypeScript bundle.
 * This guarantees 100% image availability on Vercel, Cloud Run, and GitHub
 * exports even when static binary files are omitted or rewritten by SPA routing.
 */
export function resolveAssetUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('data:')) {
    return trimmed;
  }

  if (EMBEDDED_ASSETS[trimmed]) {
    return EMBEDDED_ASSETS[trimmed];
  }

  // Handle relative paths like "assets/prera/..." or "./assets/prera/..."
  const normalized = trimmed.startsWith('./')
    ? trimmed.slice(1)
    : trimmed.startsWith('assets/') || trimmed.startsWith('src/assets/')
      ? `/${trimmed}`
      : trimmed;

  if (EMBEDDED_ASSETS[normalized]) {
    return EMBEDDED_ASSETS[normalized];
  }

  // Handle full URLs where browser or origin was prepended (e.g. https://app.vercel.app/assets/...)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (EMBEDDED_ASSETS[parsed.pathname]) {
        return EMBEDDED_ASSETS[parsed.pathname];
      }
    } catch {
      // Ignore invalid URL
    }
  }

  return trimmed;
}

function patchImageElement(img: HTMLImageElement): void {
  const rawAttr = img.getAttribute('src');
  if (rawAttr && !rawAttr.startsWith('data:')) {
    const resolved = resolveAssetUrl(rawAttr);
    if (resolved !== rawAttr) {
      img.setAttribute('src', resolved);
      return;
    }
  }

  if (img.src && !img.src.startsWith('data:')) {
    const resolved = resolveAssetUrl(img.src);
    if (resolved !== img.src) {
      img.src = resolved;
    }
  }
}

function scanSubtree(root: ParentNode): void {
  if (root instanceof HTMLImageElement) {
    patchImageElement(root);
  }
  const images = root.querySelectorAll?.('img');
  if (images) {
    images.forEach(patchImageElement);
  }
}

/**
 * Installs a global DOM observer and capture-phase error handler so that
 * any `<img>` element rendered anywhere in the application (including islands,
 * modals, cart drawers, or Firestore-synced catalog records) automatically
 * resolves `/assets/...` paths to embedded base64 Data URIs.
 */
export function installGlobalAssetInterceptor(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  scanSubtree(document);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === 'attributes' &&
        mutation.target instanceof HTMLImageElement
      ) {
        patchImageElement(mutation.target);
      } else if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLImageElement) {
            patchImageElement(node);
          } else if (node instanceof HTMLElement) {
            scanSubtree(node);
          }
        });
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src'],
  });

  window.addEventListener(
    'error',
    (event) => {
      const target = event.target;
      if (target instanceof HTMLImageElement) {
        patchImageElement(target);
      }
    },
    true
  );
}
