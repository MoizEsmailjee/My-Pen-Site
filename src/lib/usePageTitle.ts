import { useEffect } from 'react';

const SITE_TITLE = 'PENS R US — Japanese Fountain Pens & Inks Kenya';

/** Sets the browser tab title for the current page and restores the site title on leave. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · PENS R US Kenya` : SITE_TITLE;
    return () => {
      document.title = SITE_TITLE;
    };
  }, [title]);
}
