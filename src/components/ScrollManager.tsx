import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Restores expected scroll behaviour for client-side navigation:
 * a new page starts at the top, and a `#hash` link scrolls to its target.
 */
export function ScrollManager() {
  const { key, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [key, hash]);

  return null;
}
