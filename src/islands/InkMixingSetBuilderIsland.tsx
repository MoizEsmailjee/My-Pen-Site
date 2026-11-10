import React, { useState, useMemo } from 'react';
import { Check, Sparkles, Shuffle, Eye } from 'lucide-react';
import {
  FEATURED_PRODUCTS,
  INK_STUDIO_SHADES,
  InkShadeOption,
  Product,
  ProductVariant,
} from '../data/products';
import { resolveAssetUrl } from '../utils/assetResolver';

interface InkMixingSetBuilderIslandProps {
  onAddInkMixingSetToCart: (
    items: {
      product: Product;
      variant: ProductVariant;
    }[]
  ) => void;
}

const INK_FAMILIES = [
  'All 24 Shades',
  'Blues & Teals',
  'Reds, Pinks & Purples',
  'Greens & Golds',
  'Blacks, Greys & Browns',
] as const;

const CURATED_TRIO_PRESETS: {
  id: string;
  label: string;
  subtitle: string;
  shades: [string, string, string];
}[] = [
  {
    id: 'pacific-trio',
    label: 'Ocean & Sky Trio',
    subtitle: 'Ama-iro · Ku-jaku · Shin-kai',
    shades: ['iroshizuku-ama-iro', 'iroshizuku-ku-jaku', 'iroshizuku-shin-kai'],
  },
  {
    id: 'kyoto-autumn',
    label: 'Kyoto Autumn Trio',
    subtitle: 'Yama-budo · Momiji · Yu-yake',
    shades: ['iroshizuku-yama-budo', 'iroshizuku-momiji', 'iroshizuku-yu-yake'],
  },
  {
    id: 'forest-canopy',
    label: 'Bamboo & Pine Trio',
    subtitle: 'Chiku-rin · Syo-ro · Yama-guri',
    shades: ['iroshizuku-chiku-rin', 'iroshizuku-syo-ro', 'iroshizuku-yama-guri'],
  },
  {
    id: 'spring-blossom',
    label: 'Heian Blossom Trio',
    subtitle: 'Hana-ikada · Ajisai · Murasaki-shikibu',
    shades: [
      'iroshizuku-hana-ikada',
      'iroshizuku-ajisai',
      'iroshizuku-murasaki-shikibu',
    ],
  },
];

function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function mixHexColors(hexes: string[]): string {
  if (hexes.length === 0) return '#163A5F';
  const totals = hexes.reduce(
    (acc, hex) => {
      const [r, g, b] = hexToRgb(hex);
      return [acc[0] + r, acc[1] + g, acc[2] + b];
    },
    [0, 0, 0]
  );
  const r = Math.round(totals[0] / hexes.length);
  const g = Math.round(totals[1] / hexes.length);
  const b = Math.round(totals[2] / hexes.length);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

export function InkMixingSetBuilderIsland({
  onAddInkMixingSetToCart,
}: InkMixingSetBuilderIslandProps) {
  const iroshizukuProduct = useMemo(
    () => FEATURED_PRODUCTS.find((p) => p.id === 'pilot-iroshizuku-ink')!,
    []
  );

  // Three distinct selected 50ml Iroshizuku shade IDs
  const [selectedShadeIds, setSelectedShadeIds] = useState<[string, string, string]>([
    'iroshizuku-ama-iro',
    'iroshizuku-yama-budo',
    'iroshizuku-chiku-rin',
  ]);

  // Active slot index currently being edited (0, 1, or 2)
  const [activeSlotIdx, setActiveSlotIdx] = useState<0 | 1 | 2>(0);

  // Filter for the 24-shade selector grid
  const [activeFamily, setActiveFamily] =
    useState<(typeof INK_FAMILIES)[number]>('All 24 Shades');

  // Toggle between Bottle view and Swatch view on the 3 selected cards
  const [showSwatchPreview, setShowSwatchPreview] = useState<boolean>(false);

  // Added confirmation feedback state
  const [setAddedFeedback, setSetAddedFeedback] = useState<boolean>(false);

  const selectedShades: [InkShadeOption, InkShadeOption, InkShadeOption] = useMemo(() => {
    const s0 =
      INK_STUDIO_SHADES.find((s) => s.id === selectedShadeIds[0]) ||
      INK_STUDIO_SHADES[0];
    const s1 =
      INK_STUDIO_SHADES.find((s) => s.id === selectedShadeIds[1]) ||
      INK_STUDIO_SHADES[1];
    const s2 =
      INK_STUDIO_SHADES.find((s) => s.id === selectedShadeIds[2]) ||
      INK_STUDIO_SHADES[2];
    return [s0, s1, s2];
  }, [selectedShadeIds]);

  const filteredShades = useMemo(() => {
    if (activeFamily === 'All 24 Shades') return INK_STUDIO_SHADES;
    return INK_STUDIO_SHADES.filter((shade) => shade.colorFamily === activeFamily);
  }, [activeFamily]);

  // Blended color previews
  const blend1And2Hex = useMemo(
    () => mixHexColors([selectedShades[0].hex, selectedShades[1].hex]),
    [selectedShades]
  );
  const blend2And3Hex = useMemo(
    () => mixHexColors([selectedShades[1].hex, selectedShades[2].hex]),
    [selectedShades]
  );
  const blend1And3Hex = useMemo(
    () => mixHexColors([selectedShades[0].hex, selectedShades[2].hex]),
    [selectedShades]
  );
  const trioMasterBlendHex = useMemo(
    () =>
      mixHexColors([
        selectedShades[0].hex,
        selectedShades[1].hex,
        selectedShades[2].hex,
      ]),
    [selectedShades]
  );

  // Pricing math: 3 × KES 6,000 = KES 18,000 standard retail.
  // 10% Bundle Privilege yields KES 16,200 (saving KES 1,800).
  const singleBottlePriceKes = iroshizukuProduct.priceKes; // 6000
  const standardTrioPriceKes = singleBottlePriceKes * 3; // 18000
  const bundlePriceKes = Math.round(standardTrioPriceKes * 0.9); // 16200
  const savingsKes = standardTrioPriceKes - bundlePriceKes; // 1800

  const handleSelectShadeForActiveSlot = (shadeId: string) => {
    const existingIdx = selectedShadeIds.indexOf(shadeId);
    if (existingIdx !== -1) {
      // If user clicks a shade already in another slot, focus that slot or swap if different
      if (existingIdx !== activeSlotIdx) {
        setSelectedShadeIds((prev) => {
          const next: [string, string, string] = [...prev] as [string, string, string];
          const currentSlotShade = next[activeSlotIdx];
          next[activeSlotIdx] = shadeId;
          next[existingIdx as 0 | 1 | 2] = currentSlotShade;
          return next;
        });
      }
      return;
    }

    setSelectedShadeIds((prev) => {
      const next: [string, string, string] = [...prev] as [string, string, string];
      next[activeSlotIdx] = shadeId;
      return next;
    });

    // Advance automatically to the next slot for smooth 1-2-3 curation
    setActiveSlotIdx((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
  };

  const handleApplyPreset = (shades: [string, string, string]) => {
    setSelectedShadeIds(shades);
    setActiveSlotIdx(0);
  };

  const handleRandomizeDistinctTrio = () => {
    const pool = [...INK_STUDIO_SHADES];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setSelectedShadeIds([pool[0].id, pool[1].id, pool[2].id]);
  };

  const handleAddTrioSetToBag = () => {
    const bundleItems = selectedShades.map((shade) => {
      const matchedVariant =
        iroshizukuProduct.variants.find((v) => v.id === shade.id) ||
        iroshizukuProduct.variants[0];
      return {
        product: iroshizukuProduct,
        variant: matchedVariant,
      };
    });

    onAddInkMixingSetToCart(bundleItems);
    setSetAddedFeedback(true);
    setTimeout(() => setSetAddedFeedback(false), 2000);
  };

  return (
    <div
      id="ink-mixing-set-builder"
      className="mt-16 pt-14 border-t border-[#DCD5C7]"
    >
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#B58435] mb-2">
            Bespoke Chromatic Trio · 3 × 50ml Pilot Iroshizuku Glass Flacons (150ml Total)
          </p>
          <h3
            className="font-serif-display text-2xl lg:text-4xl font-semibold text-[#0A2246] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Iroshizuku Ink Mixing Set Builder
          </h3>
          <p className="text-sm text-[#4A4742] mt-2 max-w-2xl leading-relaxed">
            Curate three distinct 50ml Pilot Iroshizuku fountain pen ink shades for custom
            color blending, seasonal journaling, or multi-pen rotation. Enjoy our{' '}
            <strong>10% Atelier Trio Privilege</strong> at a special bundle price of{' '}
            <strong className="text-[#0A2246]">{formatKes(bundlePriceKes)}</strong> (standard value{' '}
            <span className="line-through text-[#8C857B]">{formatKes(standardTrioPriceKes)}</span> · save{' '}
            <strong className="text-[#1D5B43]">{formatKes(savingsKes)}</strong>).
          </p>
        </div>

        {/* Curated Trio Quick Presets + Randomize */}
        <div className="flex flex-wrap items-center gap-2">
          {CURATED_TRIO_PRESETS.map((preset) => {
            const isCurrentPreset =
              preset.shades[0] === selectedShadeIds[0] &&
              preset.shades[1] === selectedShadeIds[1] &&
              preset.shades[2] === selectedShadeIds[2];
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset.shades)}
                className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors cursor-pointer whitespace-nowrap ${
                  isCurrentPreset
                    ? 'bg-[#0A2246] text-white border-[#0A2246]'
                    : 'bg-white text-[#3F3D39] border-[#DCD5C7] hover:border-[#0A2246]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleRandomizeDistinctTrio}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0A2246] bg-[#EDE8DF] hover:bg-[#0A2246] hover:text-white rounded border border-[#DCD5C7] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Surprise Trio</span>
          </button>
        </div>
      </div>

      {/* Main Builder Workbench */}
      <div className="bg-white border border-[#DCD5C7] rounded-lg overflow-hidden shadow-2xs">
        {/* Top Row: 3 Selected 50ml Flacon Slots + Live Chromatic Blend Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-[#E6E1D8]">
          {/* 3 Distinct Ink Flacon Cards (Cols 1-8) */}
          <div className="lg:col-span-8 p-6 border-b lg:border-b-0 lg:border-r border-[#E6E1D8] bg-[#FAF8F5]">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="text-xs text-[#524E48]">
                <span className="font-semibold text-[#0A2246]">
                  Step 1: Select Any Slot Below
                </span>{' '}
                · Click Flacon 01, 02, or 03 to customize its shade from all 24 Iroshizuku
                colors
              </div>
              <button
                type="button"
                onClick={() => setShowSwatchPreview((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#0A2246] bg-white hover:bg-[#EDE8DF] rounded border border-[#DCD5C7] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Eye className="w-3.5 h-3.5 text-[#C88A2E]" />
                <span>{showSwatchPreview ? 'Show 50ml Bottles' : 'Show Ink Swatches'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {selectedShades.map((shade, idx) => {
                const slotIndex = idx as 0 | 1 | 2;
                const isSlotActive = activeSlotIdx === slotIndex;
                return (
                  <div
                    key={`slot-${slotIndex}-${shade.id}`}
                    onClick={() => setActiveSlotIdx(slotIndex)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveSlotIdx(slotIndex);
                      }
                    }}
                    className={`rounded-lg border p-4 bg-white transition-all cursor-pointer flex flex-col justify-between ${
                      isSlotActive
                        ? 'border-[#0A2246] ring-2 ring-[#0A2246]/15 shadow-sm'
                        : 'border-[#E6E1D8] hover:border-[#BDB6AA]'
                    }`}
                  >
                    <div>
                      {/* Slot Header */}
                      <div className="flex items-center justify-between text-xs mb-2.5">
                        <span
                          className={`font-mono-tabular font-semibold uppercase tracking-wider ${
                            isSlotActive ? 'text-[#0A2246]' : 'text-[#6E6A63]'
                          }`}
                        >
                          Flacon 0{slotIndex + 1}
                        </span>
                        <span className="text-[11px] font-medium text-[#6E6A63]">
                          {isSlotActive ? 'Editing Slot' : 'Click to Change'}
                        </span>
                      </div>

                      {/* Bottle / Swatch Image */}
                      <div className="relative aspect-square w-full bg-white rounded border border-[#ECE8DF] p-3 flex items-center justify-center mb-3 overflow-hidden">
                        <img
                          loading="lazy"
                          decoding="async"
                          src={resolveAssetUrl(
                            showSwatchPreview ? shade.swatchImage : shade.image
                          )}
                          alt={`${shade.name} 50ml Iroshizuku Ink`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                        <span
                          className="absolute bottom-2 right-2 w-5 h-5 rounded-full border border-white shadow-xs"
                          style={{ backgroundColor: shade.hex }}
                          title={shade.name}
                        />
                      </div>

                      {/* Shade Title & Meaning */}
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="font-serif-display text-lg font-semibold text-[#171614]">
                          {shade.name}
                        </h4>
                        <span className="text-xs text-[#8C857B]">{shade.kanji}</span>
                      </div>
                      <p className="text-xs font-medium text-[#0A2246] mt-0.5">
                        {shade.meaning}
                      </p>
                      <p className="text-[11px] text-[#6E6A63] mt-1 line-clamp-2 leading-snug">
                        {shade.sheenNote}
                      </p>
                    </div>

                    {/* Individual vs Bundle Price Line */}
                    <div className="pt-3 mt-3 border-t border-[#ECE8DF] flex items-center justify-between text-xs">
                      <span className="text-[#8C857B] line-through font-mono-tabular">
                        {formatKes(singleBottlePriceKes)}
                      </span>
                      <span className="font-mono-tabular font-semibold text-[#1D5B43]">
                        Included in Set
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Chromatic Mixing Workbench & Bundle Checkout Box (Cols 9-12) */}
          <div className="lg:col-span-4 p-6 flex flex-col justify-between bg-white">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#B58435] block">
                  Chromatic Alchemy Preview
                </span>
                <h4 className="font-serif-display text-xl font-semibold text-[#0A2246] mt-0.5">
                  Your 3-Shade Palette &amp; Blends
                </h4>
                <p className="text-xs text-[#5C5852] mt-1 leading-relaxed">
                  All Pilot Iroshizuku water-based dye inks are pH-balanced and safe to mix in
                  sample vials or Pilot CON-40 converters to create bespoke signature hues.
                </p>
              </div>

              {/* 3 Pure Shades + 4 Mixed Ratio Swatches */}
              <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E6E1D8] space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#524E48]">
                  Pure Flacon Shades (3 × 50ml)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {selectedShades.map((shade, i) => (
                    <div
                      key={`pure-${shade.id}`}
                      className="p-2 rounded bg-white border border-[#E6E1D8] text-center"
                    >
                      <div
                        className="w-full h-6 rounded-xs mb-1.5 border border-black/10"
                        style={{ backgroundColor: shade.hex }}
                      />
                      <div className="text-[11px] font-semibold text-[#171614] truncate">
                        0{i + 1}. {shade.name}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#E6E1D8]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#524E48] mb-2">
                    1:1 Pairwise &amp; Trio Custom Blends
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="p-1.5 rounded bg-white border border-[#E6E1D8]">
                      <div
                        className="w-full h-5 rounded-xs mb-1 border border-black/10"
                        style={{ backgroundColor: blend1And2Hex }}
                      />
                      <span className="text-[10px] font-mono-tabular text-[#524E48] block truncate">
                        01 + 02
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-[#E6E1D8]">
                      <div
                        className="w-full h-5 rounded-xs mb-1 border border-black/10"
                        style={{ backgroundColor: blend2And3Hex }}
                      />
                      <span className="text-[10px] font-mono-tabular text-[#524E48] block truncate">
                        02 + 03
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-[#E6E1D8]">
                      <div
                        className="w-full h-5 rounded-xs mb-1 border border-black/10"
                        style={{ backgroundColor: blend1And3Hex }}
                      />
                      <span className="text-[10px] font-mono-tabular text-[#524E48] block truncate">
                        01 + 03
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-[#0A2246]/30">
                      <div
                        className="w-full h-5 rounded-xs mb-1 border border-black/10"
                        style={{ backgroundColor: trioMasterBlendHex }}
                      />
                      <span className="text-[10px] font-mono-tabular font-semibold text-[#0A2246] block truncate">
                        1:1:1 Trio
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Washi Paper Blended Stroke Sample */}
                <div className="p-3 rounded bg-[#FDFBF7] border border-[#E6E1D8]">
                  <span className="text-[10px] uppercase tracking-wider text-[#8C857B] block mb-1">
                    Custom Trio Blend on Washi Paper ({trioMasterBlendHex.toUpperCase()})
                  </span>
                  <p
                    className="font-serif-display text-base italic leading-snug"
                    style={{ color: trioMasterBlendHex }}
                  >
                    &ldquo;{selectedShades[0].name} + {selectedShades[1].name} +{' '}
                    {selectedShades[2].name} — Bespoke Nairobi Atelier Blend&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Breakdown & Add Bundle Button */}
            <div className="pt-4 mt-4 border-t border-[#E6E1D8] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#5C5852]">
                  <span>3 × 50ml Iroshizuku Flacons</span>
                  <span className="font-mono-tabular line-through text-[#8C857B]">
                    {formatKes(standardTrioPriceKes)}
                  </span>
                </div>
                <div className="flex justify-between text-[#1D5B43] font-medium">
                  <span>10% Ink Mixing Set Discount</span>
                  <span className="font-mono-tabular">-{formatKes(savingsKes)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-[#ECE8DF]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0A2246]">
                    Bundle Price
                  </span>
                  <div className="text-right">
                    <span className="font-mono-tabular text-xl font-bold text-[#0A2246]">
                      {formatKes(bundlePriceKes)}
                    </span>
                    <span className="block text-[10px] text-[#1D5B43]">
                      Free Same-Day Nairobi &amp; Nationwide Courier
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddTrioSetToBag}
                className={`w-full py-3 px-4 text-xs font-semibold tracking-wider uppercase rounded flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  setAddedFeedback
                    ? 'bg-[#1D5B43] text-white'
                    : 'bg-[#0A2246] hover:bg-[#133468] text-white'
                }`}
              >
                {setAddedFeedback ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>3-Bottle Ink Mixing Set Added · {formatKes(bundlePriceKes)}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E5B25D]" />
                    <span>Add Ink Mixing Set (3 × 50ml) · {formatKes(bundlePriceKes)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row: Full 24-Shade Palette Picker for Active Slot */}
        <div className="p-6 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0A2246]">
                Step 2: Choose Shade for Flacon 0{activeSlotIdx + 1}
              </span>
              <span className="text-xs text-[#6E6A63]">
                (Currently: <strong>{selectedShades[activeSlotIdx].name}</strong> ·{' '}
                {selectedShades[activeSlotIdx].meaning})
              </span>
            </div>

            {/* Color Family Filter Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {INK_FAMILIES.map((family) => {
                const active = activeFamily === family;
                return (
                  <button
                    key={family}
                    type="button"
                    onClick={() => setActiveFamily(family)}
                    className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#0A2246] text-white border-[#0A2246]'
                        : 'bg-[#FAF8F5] text-[#524E48] border-[#DCD5C7] hover:border-[#0A2246]'
                    }`}
                  >
                    {family}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 24-Shade Swatch Picker Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {filteredShades.map((shade) => {
              const assignedSlotIdx = selectedShadeIds.indexOf(shade.id);
              const isAssigned = assignedSlotIdx !== -1;
              const isCurrentSlot = assignedSlotIdx === activeSlotIdx;

              return (
                <button
                  key={shade.id}
                  type="button"
                  onClick={() => handleSelectShadeForActiveSlot(shade.id)}
                  className={`p-2.5 rounded border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrentSlot
                      ? 'border-[#0A2246] bg-[#0A2246]/8 ring-1 ring-[#0A2246]'
                      : isAssigned
                      ? 'border-[#C88A2E] bg-[#C88A2E]/8'
                      : 'border-[#E6E1D8] bg-[#FAF8F5] hover:border-[#0A2246] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <span
                      className="w-5 h-5 rounded-full border border-black/15 shrink-0"
                      style={{ backgroundColor: shade.hex }}
                    />
                    {isAssigned ? (
                      <span className="font-mono-tabular text-[10px] font-bold text-[#0A2246]">
                        Flacon 0{assignedSlotIdx + 1}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#8C857B]">{shade.kanji}</span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#171614] truncate">
                      {shade.name}
                    </div>
                    <div className="text-[10px] text-[#6E6A63] truncate">
                      {shade.meaning}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
