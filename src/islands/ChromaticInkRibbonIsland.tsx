import React, { useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Plus,
  ZoomIn,
} from 'lucide-react';
import { INK_STUDIO_SHADES, InkShadeOption } from '../data/products';
import { resolveAssetUrl } from '../utils/assetResolver';

interface ChromaticInkRibbonIslandProps {
  justAddedKey: string | null;
  onAddInkShade: (shade: InkShadeOption) => void;
  isShadeWishlisted: (shadeId: string) => boolean;
  onToggleShadeWishlist: (shade: InkShadeOption) => void;
  onOpenZoomModal: (payload: {
    src: string;
    secondarySrc?: string;
    activeView: 'primary' | 'secondary';
    title: string;
    subtitle?: string;
    swatchHex?: string;
    inkShadeId?: string;
  }) => void;
}

export function ChromaticInkRibbonIsland({
  justAddedKey,
  onAddInkShade,
  isShadeWishlisted,
  onToggleShadeWishlist,
  onOpenZoomModal,
}: ChromaticInkRibbonIslandProps) {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const activeShade = INK_STUDIO_SHADES[selectedIdx] || INK_STUDIO_SHADES[0];
  const isAdded = justAddedKey === `pilot-iroshizuku-ink-${activeShade.id}`;
  const wishlisted = isShadeWishlisted(activeShade.id);

  const handlePrev = () => {
    setSelectedIdx(
      (prev) => (prev - 1 + INK_STUDIO_SHADES.length) % INK_STUDIO_SHADES.length
    );
  };

  const handleNext = () => {
    setSelectedIdx((prev) => (prev + 1) % INK_STUDIO_SHADES.length);
  };

  return (
    <div className="mb-12 bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden">
      {/* Top Chromatic Spectrum Ribbon Bar */}
      <div className="p-5 sm:p-6 border-b border-[#E6E1D8] bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-[#6E6A63]">
            <span className="font-semibold uppercase tracking-[0.14em] text-[#0A2246]">
              24-Color Chromatic Spectrum
            </span>
            <span aria-hidden="true">·</span>
            <span>Select any droplet to inspect bottle &amp; handwritten swatch side-by-side</span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="font-mono-tabular text-xs text-[#6E6A63]">
              {String(selectedIdx + 1).padStart(2, '0')} / {INK_STUDIO_SHADES.length}
            </span>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous ink shade"
              className="p-1.5 rounded border border-[#E6E1D8] text-[#0A2246] hover:border-[#0A2246] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next ink shade"
              className="p-1.5 rounded border border-[#E6E1D8] text-[#0A2246] hover:border-[#0A2246] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 24 Interactive Color Swatch Droplets */}
        <div
          role="listbox"
          aria-label="Pilot Iroshizuku 24 Ink Shades Chromatic Ribbon"
          className="grid grid-cols-8 sm:grid-cols-12 lg:grid-cols-24 gap-2"
        >
          {INK_STUDIO_SHADES.map((shade, idx) => {
            const active = idx === selectedIdx;
            return (
              <button
                key={shade.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => setSelectedIdx(idx)}
                title={`${shade.name} (${shade.kanji}) — ${shade.meaning}`}
                className={`group relative flex flex-col items-center py-1.5 px-1 rounded transition-transform duration-150 cursor-pointer ${
                  active
                    ? 'bg-[#F3EFE8] ring-1 ring-[#0A2246] -translate-y-0.5'
                    : 'hover:bg-[#FAF8F5] hover:-translate-y-0.5'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full border transition-transform ${
                    active
                      ? 'scale-110 border-[#0A2246] shadow-xs'
                      : 'border-black/15 group-hover:scale-105'
                  }`}
                  style={{ backgroundColor: shade.hex }}
                />
                <span className="mt-1.5 text-[10px] font-medium text-[#524E48] truncate max-w-full">
                  {shade.name.split('-')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dual-Pedestal Spotlight Stage: Bottle + Handwritten Swatch + Editorial Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Pedestal 1: 50ml Glass Bottle + Swatch Card */}
        <div className="lg:col-span-4 bg-white p-6 border-b lg:border-b-0 lg:border-r border-[#E6E1D8] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#6E6A63] mb-2">
            <span>01 · 50ml Blown-Glass Flacon</span>
            <button
              type="button"
              onClick={() =>
                onOpenZoomModal({
                  src: activeShade.image,
                  secondarySrc: activeShade.swatchImage,
                  activeView: 'primary',
                  title: `Pilot Iroshizuku — ${activeShade.name} (${activeShade.kanji})`,
                  subtitle: `${activeShade.meaning} · ${activeShade.sheenNote}`,
                  swatchHex: activeShade.hex,
                  inkShadeId: activeShade.id,
                })
              }
              className="inline-flex items-center gap-1 text-[#0A2246] hover:underline font-medium cursor-pointer whitespace-nowrap"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Zoom 3×</span>
            </button>
          </div>

          <div
            onClick={() =>
              onOpenZoomModal({
                src: activeShade.image,
                secondarySrc: activeShade.swatchImage,
                activeView: 'primary',
                title: `Pilot Iroshizuku — ${activeShade.name} (${activeShade.kanji})`,
                subtitle: `${activeShade.meaning} · ${activeShade.sheenNote}`,
                swatchHex: activeShade.hex,
                inkShadeId: activeShade.id,
              })
            }
            className="aspect-square w-full flex items-center justify-center p-4 cursor-zoom-in group"
          >
            <img
              src={resolveAssetUrl(activeShade.image)}
              alt={`Pilot Iroshizuku ${activeShade.name} 50ml Bottle`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
            />
          </div>
        </div>

        {/* Pedestal 2: Genuine Handwritten Swatch Card Close-Up */}
        <div className="lg:col-span-4 bg-white p-6 border-b lg:border-b-0 lg:border-r border-[#E6E1D8] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#6E6A63] mb-2">
            <span>02 · Handwritten Swatch &amp; Shading</span>
            <button
              type="button"
              onClick={() =>
                onOpenZoomModal({
                  src: activeShade.image,
                  secondarySrc: activeShade.swatchImage,
                  activeView: 'secondary',
                  title: `Pilot Iroshizuku — ${activeShade.name} (${activeShade.kanji})`,
                  subtitle: `${activeShade.meaning} · ${activeShade.sheenNote}`,
                  swatchHex: activeShade.hex,
                  inkShadeId: activeShade.id,
                })
              }
              className="inline-flex items-center gap-1 text-[#0A2246] hover:underline font-medium cursor-pointer whitespace-nowrap"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Inspect Swatch</span>
            </button>
          </div>

          <div
            onClick={() =>
              onOpenZoomModal({
                src: activeShade.image,
                secondarySrc: activeShade.swatchImage,
                activeView: 'secondary',
                title: `Pilot Iroshizuku — ${activeShade.name} (${activeShade.kanji})`,
                subtitle: `${activeShade.meaning} · ${activeShade.sheenNote}`,
                swatchHex: activeShade.hex,
                inkShadeId: activeShade.id,
              })
            }
            className="aspect-square w-full flex items-center justify-center p-4 cursor-zoom-in group"
          >
            <img
              src={resolveAssetUrl(activeShade.swatchImage)}
              alt={`Pilot Iroshizuku ${activeShade.name} Handwritten Swatch Card`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
            />
          </div>
        </div>

        {/* Pedestal 3: Editorial Notes, Wet/Dry Chromatic Bar, Wishlist & Direct Purchase */}
        <div className="lg:col-span-4 p-6 lg:p-8 bg-[#FAF8F5] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#6E6A63]">
              <span>{activeShade.colorFamily}</span>
              <span aria-hidden="true">·</span>
              <span>Pilot Japan</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#0A2246] font-medium">In Stock</span>
            </div>

            <div className="flex items-baseline justify-between gap-3 mt-2">
              <h4 className="font-serif-display text-2xl lg:text-3xl font-semibold text-[#171614]">
                {activeShade.name}{' '}
                <span className="text-lg font-normal text-[#6E6A63]">
                  ({activeShade.kanji})
                </span>
              </h4>
              <span className="font-mono-tabular text-lg font-semibold text-[#0A2246] whitespace-nowrap shrink-0">
                KES 6,000
              </span>
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B58435] mt-1">
              Poetic Translation: “{activeShade.meaning}”
            </p>

            <p className="text-sm text-[#4A4742] mt-4 leading-relaxed">
              {activeShade.sheenNote}
            </p>

            {/* Wet Pool to Dry Shading Gradient Preview */}
            <div className="mt-5 pt-4 border-t border-[#E6E1D8]">
              <div className="flex items-center justify-between text-[11px] text-[#6E6A63] mb-1.5">
                <span>Wet Nib Pool</span>
                <span>Shaded Dry Stroke</span>
              </div>
              <div
                className="h-3.5 w-full rounded-sm border border-black/15"
                style={{
                  background: `linear-gradient(90deg, ${activeShade.hex} 0%, ${activeShade.secondaryHex} 100%)`,
                }}
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E6E1D8] flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onAddInkShade(activeShade)}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold tracking-wider uppercase rounded transition-colors cursor-pointer whitespace-nowrap ${
                  isAdded
                    ? 'bg-[#1D5B43] text-white'
                    : 'bg-[#0A2246] hover:bg-[#133468] text-white'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added {activeShade.name}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Bottle · KES 6,000</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onToggleShadeWishlist(activeShade)}
                aria-pressed={wishlisted}
                className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  wishlisted
                    ? 'border-[#C88A2E] bg-[#C88A2E]/12 text-[#0A2246]'
                    : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246]'
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    wishlisted ? 'fill-[#C88A2E] text-[#C88A2E]' : ''
                  }`}
                />
                <span>{wishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
