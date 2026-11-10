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
      className="pt-10"
    >
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] uppercase text-brand mb-2">
            Bespoke Chromatic Trio · 3 × 50ml Pilot Iroshizuku Glass Flacons (150ml Total)
          </p>
          <h3
            className="font-serif-display text-2xl lg:text-4xl font-semibold text-ink tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Iroshizuku Ink Mixing Set Builder
          </h3>
          <p className="text-sm text-ink-soft mt-2 max-w-2xl leading-relaxed">
            Curate three distinct 50ml Pilot Iroshizuku fountain pen ink shades for custom
            color blending, seasonal journaling, or multi-pen rotation. Enjoy our{' '}
            <strong>10% Atelier Trio Privilege</strong> at a special bundle price of{' '}
            <strong className="text-ink">{formatKes(bundlePriceKes)}</strong> (standard value{' '}
            <span className="line-through text-faint">{formatKes(standardTrioPriceKes)}</span> · save{' '}
            <strong className="text-ok">{formatKes(savingsKes)}</strong>).
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
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white text-ink-soft border-line hover:border-ink'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleRandomizeDistinctTrio}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink bg-wash hover:bg-ink hover:text-white rounded border border-line transition-colors cursor-pointer whitespace-nowrap"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Surprise Trio</span>
          </button>
        </div>
      </div>

      {/* Main Builder Workbench */}
      <div className="bg-white border border-line rounded-lg overflow-hidden shadow-2xs">
        {/* Top Row: 3 Selected 50ml Flacon Slots + Live Chromatic Blend Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-line">
          {/* 3 Distinct Ink Flacon Cards (Cols 1-8) */}
          <div className="lg:col-span-8 p-6 border-b lg:border-b-0 lg:border-r border-line bg-paper">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="text-xs text-ink-soft">
                <span className="font-semibold text-ink">
                  Step 1: Select Any Slot Below
                </span>{' '}
                · Click Flacon 01, 02, or 03 to customize its shade from all 24 Iroshizuku
                colors
              </div>
              <button
                type="button"
                onClick={() => setShowSwatchPreview((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-ink bg-white hover:bg-wash rounded border border-line transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Eye className="w-3.5 h-3.5 text-brand" />
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
                        ? 'border-ink ring-2 ring-ink/15 shadow-sm'
                        : 'border-line hover:border-faint'
                    }`}
                  >
                    <div>
                      {/* Slot Header */}
                      <div className="flex items-center justify-between text-xs mb-2.5">
                        <span
                          className={`font-mono-tabular font-semibold uppercase tracking-wider ${
                            isSlotActive ? 'text-ink' : 'text-ink-soft'
                          }`}
                        >
                          Flacon 0{slotIndex + 1}
                        </span>
                        <span className="text-xs font-medium text-ink-soft">
                          {isSlotActive ? 'Editing Slot' : 'Click to Change'}
                        </span>
                      </div>

                      {/* Bottle / Swatch Image */}
                      <div className="relative aspect-square w-full bg-white rounded border border-line p-3 flex items-center justify-center mb-3 overflow-hidden">
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
                        <h4 className="font-serif-display text-lg font-semibold text-ink">
                          {shade.name}
                        </h4>
                        <span className="text-xs text-faint">{shade.kanji}</span>
                      </div>
                      <p className="text-xs font-medium text-ink mt-0.5">
                        {shade.meaning}
                      </p>
                      <p className="text-xs text-ink-soft mt-1 line-clamp-2 leading-snug">
                        {shade.sheenNote}
                      </p>
                    </div>

                    {/* Individual vs Bundle Price Line */}
                    <div className="pt-3 mt-3 border-t border-line flex items-center justify-between text-xs">
                      <span className="text-faint line-through font-mono-tabular">
                        {formatKes(singleBottlePriceKes)}
                      </span>
                      <span className="font-mono-tabular font-semibold text-ok">
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
                <span className="text-xs font-semibold uppercase tracking-wider text-brand block">
                  Chromatic Alchemy Preview
                </span>
                <h4 className="font-serif-display text-xl font-semibold text-ink mt-0.5">
                  Your 3-Shade Palette &amp; Blends
                </h4>
                <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                  All Pilot Iroshizuku water-based dye inks are pH-balanced and safe to mix in
                  sample vials or Pilot CON-40 converters to create bespoke signature hues.
                </p>
              </div>

              {/* 3 Pure Shades + 4 Mixed Ratio Swatches */}
              <div className="p-3.5 rounded-lg bg-paper border border-line space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Pure Flacon Shades (3 × 50ml)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {selectedShades.map((shade, i) => (
                    <div
                      key={`pure-${shade.id}`}
                      className="p-2 rounded bg-white border border-line text-center"
                    >
                      <div
                        className="w-full h-6 rounded-xs mb-1.5 border border-black/10"
                        style={{ backgroundColor: shade.hex }}
                      />
                      <div className="text-xs font-semibold text-ink truncate">
                        0{i + 1}. {shade.name}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-line">
                  <div className="text-xs font-semibold uppercase tracking-wider text-ink-soft mb-2">
                    1:1 Pairwise &amp; Trio Custom Blends
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="p-1.5 rounded bg-white border border-line">
                      <div
                        className="w-full h-5 rounded-xs mb-1 border border-black/10"
                        style={{ backgroundColor: blend1And2Hex }}
                      />
                      <span className="text-xs font-mono-tabular text-ink-soft block truncate">
                        01 + 02
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-line">
                      <div
                        className="w-full h-5 rounded-xs mb-1 border border-black/10"
                        style={{ backgroundColor: blend2And3Hex }}
                      />
                      <span className="text-xs font-mono-tabular text-ink-soft block truncate">
                        02 + 03
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-line">
                      <div
                        className="w-full h-5 rounded-xs mb-1 border border-black/10"
                        style={{ backgroundColor: blend1And3Hex }}
                      />
                      <span className="text-xs font-mono-tabular text-ink-soft block truncate">
                        01 + 03
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-ink/30">
                      <div
                        className="w-full h-5 rounded-xs mb-1 border border-black/10"
                        style={{ backgroundColor: trioMasterBlendHex }}
                      />
                      <span className="text-xs font-mono-tabular font-semibold text-ink block truncate">
                        1:1:1 Trio
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Washi Paper Blended Stroke Sample */}
                <div className="p-3 rounded bg-paper border border-line">
                  <span className="text-xs uppercase tracking-wider text-faint block mb-1">
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
            <div className="pt-4 mt-4 border-t border-line space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-ink-soft">
                  <span>3 × 50ml Iroshizuku Flacons</span>
                  <span className="font-mono-tabular line-through text-faint">
                    {formatKes(standardTrioPriceKes)}
                  </span>
                </div>
                <div className="flex justify-between text-ok font-medium">
                  <span>10% Ink Mixing Set Discount</span>
                  <span className="font-mono-tabular">-{formatKes(savingsKes)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-line">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink">
                    Bundle Price
                  </span>
                  <div className="text-right">
                    <span className="font-mono-tabular text-xl font-bold text-ink">
                      {formatKes(bundlePriceKes)}
                    </span>
                    <span className="block text-xs text-ok">
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
                    ? 'bg-ok text-white'
                    : 'bg-ink hover:bg-ink-hover text-white'
                }`}
              >
                {setAddedFeedback ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>3-Bottle Ink Mixing Set Added · {formatKes(bundlePriceKes)}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-brand" />
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
              <span className="text-xs font-semibold uppercase tracking-wider text-ink">
                Step 2: Choose Shade for Flacon 0{activeSlotIdx + 1}
              </span>
              <span className="text-xs text-ink-soft">
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
                        ? 'bg-ink text-white border-ink'
                        : 'bg-paper text-ink-soft border-line hover:border-ink'
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
                      ? 'border-ink bg-ink/8 ring-1 ring-ink'
                      : isAssigned
                      ? 'border-brand bg-brand/8'
                      : 'border-line bg-paper hover:border-ink hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <span
                      className="w-5 h-5 rounded-full border border-black/15 shrink-0"
                      style={{ backgroundColor: shade.hex }}
                    />
                    {isAssigned ? (
                      <span className="font-mono-tabular text-xs font-bold text-ink">
                        Flacon 0{assignedSlotIdx + 1}
                      </span>
                    ) : (
                      <span className="text-xs text-faint">{shade.kanji}</span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-ink truncate">
                      {shade.name}
                    </div>
                    <div className="text-xs text-ink-soft truncate">
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
