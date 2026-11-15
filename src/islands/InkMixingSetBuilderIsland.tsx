import React, { useState, useMemo } from 'react';
import { Check, Sparkles, Shuffle, Eye, Truck, Gift, Heart } from 'lucide-react';
import {
  FEATURED_PRODUCTS,
  INK_STUDIO_SHADES,
  InkShadeOption,
  IROSHIZUKU_INITIAL_STOCK_MAP,
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
  isShadeWishlisted?: (shadeId: string) => boolean;
  onToggleShadeWishlist?: (shade: InkShadeOption) => void;
}

const INK_FAMILIES = [
  'All 24 Shades',
  'In Stock (15 Shades)',
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
    subtitle: 'Ama-iro · Kon-peki · Ku-jaku',
    shades: ['iroshizuku-ama-iro', 'iroshizuku-kon-peki', 'iroshizuku-ku-jaku'],
  },
  {
    id: 'kyoto-autumn',
    label: 'Kyoto Autumn Trio',
    subtitle: 'Yama-budo · Momiji · Yu-yake',
    shades: ['iroshizuku-yama-budo', 'iroshizuku-momiji', 'iroshizuku-yu-yake'],
  },
  {
    id: 'forest-canopy',
    label: 'Emerald & Cedar Trio',
    subtitle: 'Shin-ryoku · Sui-gyoku · Yama-guri',
    shades: ['iroshizuku-shin-ryoku', 'iroshizuku-sui-gyoku', 'iroshizuku-yama-guri'],
  },
  {
    id: 'executive-signature',
    label: 'Executive Signature Trio',
    subtitle: 'Tsuki-yo · Asa-gao · Take-sumi',
    shades: [
      'iroshizuku-tsuki-yo',
      'iroshizuku-asa-gao',
      'iroshizuku-take-sumi',
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
  isShadeWishlisted,
  onToggleShadeWishlist,
}: InkMixingSetBuilderIslandProps) {
  const iroshizukuProduct = useMemo(
    () => FEATURED_PRODUCTS.find((p) => p.id === 'pilot-iroshizuku-ink')!,
    []
  );

  // Three distinct selected 50ml Iroshizuku shade IDs (all in-stock in spreadsheet)
  const [selectedShadeIds, setSelectedShadeIds] = useState<[string, string, string]>([
    'iroshizuku-ama-iro',
    'iroshizuku-yama-budo',
    'iroshizuku-shin-ryoku',
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
    if (activeFamily === 'In Stock (15 Shades)') {
      return INK_STUDIO_SHADES.filter(
        (shade) => (IROSHIZUKU_INITIAL_STOCK_MAP[shade.id] ?? 0) > 0
      );
    }
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
  // 10% Triple Ink Combo Discount yields KES 16,200 (saving KES 1,800) + FREE DELIVERY!
  const singleBottlePriceKes = iroshizukuProduct.priceKes; // 6000
  const standardTrioPriceKes = singleBottlePriceKes * 3; // 18000
  const bundlePriceKes = Math.round(standardTrioPriceKes * 0.9); // 16200
  const savingsKes = standardTrioPriceKes - bundlePriceKes; // 1800

  const handleSelectShadeForActiveSlot = (shadeId: string) => {
    const shadeStock = IROSHIZUKU_INITIAL_STOCK_MAP[shadeId] ?? 0;
    if (shadeStock === 0) {
      const shadeObj = INK_STUDIO_SHADES.find((s) => s.id === shadeId);
      if (shadeObj && onToggleShadeWishlist) {
        onToggleShadeWishlist(shadeObj);
      }
      return;
    }

    const existingIdx = selectedShadeIds.indexOf(shadeId);
    if (existingIdx !== -1) {
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

    setActiveSlotIdx((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
  };

  const handleApplyPreset = (shades: [string, string, string]) => {
    setSelectedShadeIds(shades);
    setActiveSlotIdx(0);
  };

  const handleRandomizeDistinctTrio = () => {
    const pool = INK_STUDIO_SHADES.filter(
      (s) => (IROSHIZUKU_INITIAL_STOCK_MAP[s.id] ?? 0) > 0
    );
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
      {/* Marketable Triple Ink Combo Banner: 10% OFF + FREE Nationwide Delivery */}
      <div className="mb-8 rounded-lg border-2 border-[#C88A2E] bg-gradient-to-r from-[#0A2246] via-[#133262] to-[#0A2246] text-white p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#C88A2E] text-white text-[11px] font-bold uppercase tracking-wider">
                <Gift className="w-3.5 h-3.5" />
                <span>Collector’s Triple Ink Combo Offer</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1D5B43] text-white text-[11px] font-bold uppercase tracking-wider">
                <Truck className="w-3.5 h-3.5" />
                <span>Unlocks FREE Kenya-Wide Delivery</span>
              </span>
            </div>
            <h3 className="font-serif-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight">
              Buy Any 3 Ink Colors · Get 10% OFF + FREE Next-Day Delivery
            </h3>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
              Mix &amp; match any 3 colours of Pilot Iroshizuku 50ml glass flacons (150ml total) and enjoy an instant{' '}
              <strong className="text-[#E5B25D]">10% Triple Ink Combo Discount (Save KES 1,800)</strong>. Because your trio exceeds KES 10,000, your entire order automatically qualifies for{' '}
              <strong className="text-[#E5B25D]">FREE Delivery across Nairobi &amp; All of Kenya!</strong>
            </p>
          </div>

          <div className="bg-white text-[#0A2246] rounded-lg p-4 sm:p-5 border border-[#E5B25D] shrink-0 flex flex-col justify-between min-w-[250px]">
            <div className="flex items-center justify-between text-xs text-[#6E6A63]">
              <span>3 × 50ml Bottles Value</span>
              <span className="font-mono-tabular line-through font-semibold">
                {formatKes(standardTrioPriceKes)}
              </span>
            </div>
            <div className="my-1.5 flex items-baseline justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0A2246]">
                3-Color Combo Price
              </span>
              <span className="font-mono-tabular text-2xl font-bold text-[#0A2246]">
                {formatKes(bundlePriceKes)}
              </span>
            </div>
            <div className="pt-2 border-t border-[#ECE8DF] flex items-center justify-between text-[11px] font-semibold text-[#1D5B43]">
              <span>You Save KES 1,800 (10%)</span>
              <span>+ FREE Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#B58435] mb-2">
            Bespoke Chromatic Trio · 3 × 50ml Pilot Iroshizuku Glass Flacons (150ml Total)
          </p>
          <h4
            className="font-serif-display text-2xl lg:text-3xl font-semibold text-[#0A2246] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Curate Your 3-Color Iroshizuku Ink Combo
          </h4>
          <p className="text-sm text-[#4A4742] mt-1.5 max-w-2xl leading-relaxed">
            Select any three in-stock 50ml shades below—or click an out-of-stock shade to save it to your wishlist for our next Tokyo air-freight restock.
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
            <span>Surprise In-Stock Trio</span>
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
                · Click Flacon 01, 02, or 03 to customize its shade
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
                const stockLeft = IROSHIZUKU_INITIAL_STOCK_MAP[shade.id] ?? 0;
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
                        <span className="text-[11px] font-medium text-[#1D5B43]">
                          {stockLeft} in stock
                        </span>
                      </div>

                      {/* Bottle / Swatch Image */}
                      <div className="relative aspect-square w-full bg-white rounded border border-[#ECE8DF] p-3 flex items-center justify-center mb-3 overflow-hidden">
                        <img
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
                        KES 5,400 (10% OFF)
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
                <div className="flex justify-between text-[#1D5B43] font-semibold">
                  <span>10% Triple Ink Combo Discount</span>
                  <span className="font-mono-tabular">-{formatKes(savingsKes)}</span>
                </div>
                <div className="flex justify-between text-[#1D5B43] font-semibold">
                  <span>Next-Day Delivery (Over KES 10,000)</span>
                  <span className="font-mono-tabular">FREE (Save up to KES 700)</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-[#ECE8DF]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0A2246]">
                    Triple Combo Price
                  </span>
                  <div className="text-right">
                    <span className="font-mono-tabular text-xl font-bold text-[#0A2246]">
                      {formatKes(bundlePriceKes)}
                    </span>
                    <span className="block text-[10px] font-semibold text-[#1D5B43]">
                      ✓ Includes 10% OFF + FREE Kenya-Wide Delivery
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddTrioSetToBag}
                className={`w-full py-3.5 px-4 text-xs font-semibold tracking-wider uppercase rounded flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shadow-xs ${
                  setAddedFeedback
                    ? 'bg-[#1D5B43] text-white'
                    : 'bg-[#0A2246] hover:bg-[#133468] text-white'
                }`}
              >
                {setAddedFeedback ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>3-Color Combo Added · {formatKes(bundlePriceKes)} + FREE Delivery</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E5B25D]" />
                    <span>Add 3-Color Combo (10% OFF + FREE Delivery) · {formatKes(bundlePriceKes)}</span>
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
              const stockCount = IROSHIZUKU_INITIAL_STOCK_MAP[shade.id] ?? 0;
              const isOutOfStock = stockCount === 0;
              const wishlisted = isShadeWishlisted ? isShadeWishlisted(shade.id) : false;

              return (
                <button
                  key={shade.id}
                  type="button"
                  onClick={() => handleSelectShadeForActiveSlot(shade.id)}
                  className={`p-2.5 rounded border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isOutOfStock
                      ? wishlisted
                        ? 'border-[#C88A2E] bg-[#C88A2E]/10'
                        : 'border-rose-200 bg-rose-50/40 hover:border-rose-400'
                      : isCurrentSlot
                        ? 'border-[#0A2246] bg-[#0A2246]/8 ring-1 ring-[#0A2246]'
                        : isAssigned
                          ? 'border-[#C88A2E] bg-[#C88A2E]/8'
                          : 'border-[#E6E1D8] bg-[#FAF8F5] hover:border-[#0A2246] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <span
                      className={`w-5 h-5 rounded-full border border-black/15 shrink-0 ${
                        isOutOfStock ? 'opacity-45' : ''
                      }`}
                      style={{ backgroundColor: shade.hex }}
                    />
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-rose-700">
                        <Heart
                          className={`w-3 h-3 ${
                            wishlisted ? 'fill-[#C88A2E] text-[#C88A2E]' : 'text-rose-600'
                          }`}
                        />
                        <span>{wishlisted ? 'Saved' : 'Wishlist'}</span>
                      </span>
                    ) : isAssigned ? (
                      <span className="font-mono-tabular text-[10px] font-bold text-[#0A2246]">
                        Flacon 0{assignedSlotIdx + 1}
                      </span>
                    ) : (
                      <span className="font-mono-tabular text-[10px] text-[#1D5B43] font-semibold">
                        {stockCount} left
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#171614] truncate">
                      {shade.name}
                    </div>
                    <div className="text-[10px] text-[#6E6A63] truncate">
                      {isOutOfStock ? 'Out of Stock · Add to Wishlist' : shade.meaning}
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
