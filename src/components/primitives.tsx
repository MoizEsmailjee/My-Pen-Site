import { Feather } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BRAND_LOGO_SRC } from '../lib/storefront';
import { AssetSize, resolveAssetUrl } from '../utils/assetResolver';

export function VariantStockIndicator({
  stockCount,
  availabilityLabel,
  compact = false,
}: {
  stockCount?: number;
  availabilityLabel?: string;
  compact?: boolean;
}) {
  const count = typeof stockCount === 'number' ? stockCount : 10;

  if (count === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-rose-700 font-semibold">
        <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
        <span>Sold Out (0 left)</span>
      </span>
    );
  }

  if (count < 3) {
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold animate-pulse">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>
        <span>
          {compact
            ? `Low Stock · Only ${count} left`
            : `Low Stock · Only ${count} left in Nairobi`}
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[#6E6A63] font-normal">
      <span className="w-1.5 h-1.5 rounded-full bg-[#9E988E] shrink-0" />
      <span>
        {availabilityLabel && !compact
          ? `${availabilityLabel} (${count} in stock)`
          : `${count} in stock`}
      </span>
    </span>
  );
}

/**
 * Resilient image component complying with the Zero-Broken-Image Policy.
 */
export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle,
  size = 'thumb',
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle: string;
  /** 'full' for large editorial photos; cards and galleries use the default thumbnail. */
  size?: AssetSize;
  /** Load immediately instead of lazily. Use only for the image at the top of a page. */
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = resolveAssetUrl(src, size);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !resolvedSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F2EFE9] to-[#E5DFD3] text-[#3F3D39] p-6 text-center ${className}`}
      >
        <Feather className="w-8 h-8 mb-2 stroke-[1.25] text-[#163A5F]" />
        <span className="font-serif-display text-lg font-medium tracking-wide">
          {fallbackTitle}
        </span>
        <span className="text-xs text-[#6E6A63] mt-1">Pilot Corporation · Japan</span>
      </div>
    );
  }

  return (
    <img
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      src={resolvedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

/**
 * Tightly-cropped, background-normalized official PENS R US — THE PEN SPECIALISTS logo lockup.
 * Eliminates the outer 16:9 vignette margins and normalizes the off-white canvas to pure white
 * so mix-blend-multiply blends seamlessly into #FAF8F5 without a visible box or duplicate text.
 */
export function BrandLogoLockup({
  size = 'header',
}: {
  size?: 'header' | 'footer';
}) {
  const dimensions =
    size === 'header'
      ? 'w-[164px] h-[66px] sm:w-[184px] sm:h-[74px]'
      : 'w-[176px] h-[70px]';

  return (
    <div className={`relative overflow-hidden select-none shrink-0 ${dimensions}`}>
      <img
        src={resolveAssetUrl(BRAND_LOGO_SRC)}
        alt="PENS R US — The Pen Specialists"
        referrerPolicy="no-referrer"
        style={{
          filter: 'brightness(1.06) contrast(1.08)',
          mixBlendMode: 'multiply',
        }}
        className="absolute left-1/2 top-[52.5%] -translate-x-1/2 -translate-y-1/2 w-[138%] max-w-none h-auto pointer-events-none"
      />
    </div>
  );
}

