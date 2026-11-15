import React, { useState, useMemo } from 'react';
import { Check, Plus, Sparkles, Tag, Truck } from 'lucide-react';
import {
  FEATURED_PRODUCTS,
  INK_STUDIO_SHADES,
  IROSHIZUKU_INITIAL_STOCK_MAP,
  NibOption,
  Product,
  ProductVariant,
} from '../data/products';
import { resolveAssetUrl } from '../utils/assetResolver';

interface WritingSetBuilderIslandProps {
  onAddBundleToCart: (items: {
    product: Product;
    variant: ProductVariant;
    nibSize?: NibOption;
  }[]) => void;
}

function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

export function WritingSetBuilderIsland({
  onAddBundleToCart,
}: WritingSetBuilderIslandProps) {
  const madoromiProduct = useMemo(
    () => FEATURED_PRODUCTS.find((p) => p.id === 'pilot-kakuno-madoromi')!,
    []
  );
  const familyProduct = useMemo(
    () => FEATURED_PRODUCTS.find((p) => p.id === 'pilot-kakuno-family')!,
    []
  );
  const preraProduct = useMemo(
    () => FEATURED_PRODUCTS.find((p) => p.id === 'pilot-prera')!,
    []
  );
  const con40Product = useMemo(
    () => FEATURED_PRODUCTS.find((p) => p.id === 'pilot-con-40')!,
    []
  );
  const watermanProduct = useMemo(
    () => FEATURED_PRODUCTS.find((p) => p.id === 'waterman-ink-bottle')!,
    []
  );
  const iroshizukuProduct = useMemo(
    () => FEATURED_PRODUCTS.find((p) => p.id === 'pilot-iroshizuku-ink')!,
    []
  );

  // Step 1: Pen Selection
  const [selectedPenSeriesId, setSelectedPenSeriesId] = useState<
    'pilot-prera' | 'pilot-kakuno-madoromi' | 'pilot-kakuno-family'
  >('pilot-prera');
  const [selectedPenVariantId, setSelectedPenVariantId] =
    useState<string>('prera-empress-teal');
  const [selectedNib, setSelectedNib] = useState<NibOption>('Medium');

  // Step 2: Converter Inclusion (Pilot CON-40 at KES 1,200)
  const [includeCon40, setIncludeCon40] = useState<boolean>(true);

  // Step 3: Bottled Ink Selection ('waterman' KES 2,000 or 'iroshizuku' KES 6,000)
  const [inkLine, setInkLine] = useState<'waterman' | 'iroshizuku'>('iroshizuku');
  const [selectedWatermanVariantId, setSelectedWatermanVariantId] = useState<string>(
    'waterman-serenity-blue'
  );
  const [selectedIroshizukuVariantId, setSelectedIroshizukuVariantId] = useState<string>(
    'iroshizuku-ama-iro'
  );

  const [bundleAdded, setBundleAdded] = useState(false);

  const activePenProduct = useMemo(() => {
    if (selectedPenSeriesId === 'pilot-prera') return preraProduct;
    if (selectedPenSeriesId === 'pilot-kakuno-madoromi') return madoromiProduct;
    return familyProduct;
  }, [selectedPenSeriesId, preraProduct, madoromiProduct, familyProduct]);

  const activePenVariant = useMemo(() => {
    return (
      activePenProduct.variants.find((v) => v.id === selectedPenVariantId) ||
      activePenProduct.variants[0]
    );
  }, [activePenProduct, selectedPenVariantId]);

  const activeInkProduct = inkLine === 'waterman' ? watermanProduct : iroshizukuProduct;
  const activeInkVariant = useMemo(() => {
    const targetId =
      inkLine === 'waterman' ? selectedWatermanVariantId : selectedIroshizukuVariantId;
    return (
      activeInkProduct.variants.find((v) => v.id === targetId) ||
      activeInkProduct.variants[0]
    );
  }, [
    inkLine,
    activeInkProduct,
    selectedWatermanVariantId,
    selectedIroshizukuVariantId,
  ]);

  const preraIncludesCon40 = selectedPenSeriesId === 'pilot-prera';
  const hasCompleteBundle = preraIncludesCon40 || includeCon40;
  const bundleStandardTotalKes =
    activePenProduct.priceKes +
    (!preraIncludesCon40 && includeCon40 ? con40Product.priceKes : 0) +
    activeInkProduct.priceKes;
  const bundleDiscountKes = hasCompleteBundle
    ? Math.round(bundleStandardTotalKes * 0.05)
    : 0;
  const bundleTotalKes = bundleStandardTotalKes - bundleDiscountKes;

  const handleSelectSeries = (
    seriesId: 'pilot-prera' | 'pilot-kakuno-madoromi' | 'pilot-kakuno-family'
  ) => {
    setSelectedPenSeriesId(seriesId);
    const prod =
      seriesId === 'pilot-prera'
        ? preraProduct
        : seriesId === 'pilot-kakuno-madoromi'
          ? madoromiProduct
          : familyProduct;
    const firstInStock = prod.variants.find((v) => (v.stockCount ?? 0) > 0) || prod.variants[0];
    setSelectedPenVariantId(firstInStock.id);
  };

  const handleAddCompleteSet = () => {
    const items: {
      product: Product;
      variant: ProductVariant;
      nibSize?: NibOption;
    }[] = [
      {
        product: activePenProduct,
        variant: activePenVariant,
        nibSize: selectedNib,
      },
    ];

    if (!preraIncludesCon40 && includeCon40) {
      items.push({
        product: con40Product,
        variant: con40Product.variants[0],
      });
    }

    items.push({
      product: activeInkProduct,
      variant: activeInkVariant,
    });

    onAddBundleToCart(items);
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 2000);
  };

  return (
    <div id="writing-set-builder" className="mt-20 pt-16 border-t border-[#DCD5C7]">
      {/* Promotional 5% Bundle Discount Highlight Banner */}
      <div className="mb-8 rounded-lg border border-[#C88A2E]/40 bg-gradient-to-r from-[#0A2246] via-[#123163] to-[#0A2246] text-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#C88A2E]/20 border border-[#E5B25D]/40 flex items-center justify-center shrink-0 mt-0.5">
              <Tag className="w-5 h-5 text-[#E5B25D]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#E5B25D]">
                <span>Complete Writing Set Privilege · Save 5% Instantly</span>
              </div>
              <h4 className="font-serif-display text-xl sm:text-2xl font-semibold text-white mt-0.5">
                Bundle Any Fountain Pen + Twist Converter + Bottled Ink &amp; Get 5% OFF
              </h4>
              <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-2xl">
                Pair a Pilot Kakuno or Prera fountain pen with a Pilot CON-40 converter (included in the box with Prera) and a 50ml bottle of Iroshizuku or Waterman ink to unlock an automatic{' '}
                <strong className="text-[#E5B25D]">5% Complete Writing Set Discount</strong> at checkout.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end justify-center shrink-0 bg-white/10 border border-white/15 rounded px-4 py-3">
            <span className="text-[10px] uppercase tracking-wider text-[#E5B25D] font-semibold">
              Your Active Set Savings
            </span>
            <span className="font-mono-tabular text-lg font-bold text-white">
              {hasCompleteBundle ? `Save ${formatKes(bundleDiscountKes)} (5% OFF)` : 'Include CON-40 for 5% OFF'}
            </span>
            <span className="text-[11px] text-white/75">
              {bundleTotalKes >= 10000
                ? '✓ Qualifies for FREE Delivery (Over KES 10,000)'
                : '1-Day Processing · Ships Next Day'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#6E6A63] mb-2">
            Bespoke Desk Curation · Fountain Pen + Twist Converter + 50ml Bottled Ink (5% OFF)
          </p>
          <h3
            className="font-serif-display text-2xl lg:text-4xl font-semibold text-[#171614] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Build Your Complete Fountain Pen Writing Set
          </h3>
          <p className="text-sm text-[#4A4742] mt-2 max-w-2xl">
            Assemble a ready-to-write bottled ink kit in three steps: select your Pilot
            fountain pen and nib width (`F` or `M`), pair the <strong>Pilot CON-40 Twist Converter (KES 1,200)</strong>,
            and choose a 50ml bottle of <strong>Waterman Paris (KES 2,000)</strong> or{' '}
            <strong>Pilot Iroshizuku (KES 6,000)</strong> for an instant <strong>5% bundle discount</strong>.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 font-mono-tabular text-xs text-[#1D5B43] font-semibold bg-[#1D5B43]/10 border border-[#1D5B43]/25 px-3 py-1.5 rounded">
          <Truck className="w-3.5 h-3.5" />
          <span>
            {bundleTotalKes >= 10000
              ? 'Qualifies for FREE Delivery (Order Over KES 10,000)'
              : 'Ships Next Day · Free Delivery Over KES 10,000'}
          </span>
        </span>
      </div>

      <div className="bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Step 01: Fountain Pen & Nib */}
          <div className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-[#E6E1D8] flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center justify-between text-xs text-[#6E6A63] mb-3">
                <span className="font-semibold uppercase tracking-wider text-[#171614]">
                  01 · Fountain Pen &amp; Nib
                </span>
                <span className="font-mono-tabular font-semibold text-[#171614]">
                  {formatKes(activePenProduct.priceKes)}
                </span>
              </div>

              <div className="aspect-[4/3] w-full bg-[#FAF8F5] rounded border border-[#ECE8DF] p-4 flex items-center justify-center mb-4">
                <img
                  src={resolveAssetUrl(activePenVariant.image || activePenProduct.image)}
                  alt={activePenVariant.label}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Pen Series Selector */}
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {(
                  [
                    {
                      id: 'pilot-prera',
                      label: 'Pilot Prera',
                      price: 'KES 8,500',
                    },
                    {
                      id: 'pilot-kakuno-madoromi',
                      label: 'Madoromi',
                      price: 'KES 3,200',
                    },
                    {
                      id: 'pilot-kakuno-family',
                      label: 'Family',
                      price: 'KES 2,500',
                    },
                  ] as const
                ).map((s) => {
                  const active = selectedPenSeriesId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectSeries(s.id)}
                      className={`p-2 rounded border text-left transition-colors cursor-pointer ${
                        active
                          ? 'border-[#163A5F] bg-[#163A5F]/8 text-[#171614]'
                          : 'border-[#E6E1D8] bg-[#FAF8F5] text-[#5C5852] hover:border-[#BDB6AA]'
                      }`}
                    >
                      <div className="text-xs font-semibold truncate">{s.label}</div>
                      <div className="font-mono-tabular text-[10px] text-[#6E6A63]">
                        {s.price}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Finish / Color Swatch Picker */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {activePenProduct.variants.map((v) => {
                  const active = v.id === activePenVariant.id;
                  const outOfStock = (v.stockCount ?? 0) === 0;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => setSelectedPenVariantId(v.id)}
                      title={
                        outOfStock
                          ? `${v.label} — Out of Stock · Add to Wishlist`
                          : v.label
                      }
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border transition-colors whitespace-nowrap ${
                        outOfStock
                          ? 'border-[#E6E1D8] bg-[#FAF8F5] text-[#8C857B] opacity-50 cursor-not-allowed line-through'
                          : active
                            ? 'border-[#163A5F] bg-[#163A5F] text-white font-medium cursor-pointer'
                            : 'border-[#E6E1D8] bg-[#FAF8F5] text-[#524E48] hover:border-[#171614] cursor-pointer'
                      }`}
                    >
                      {v.swatchHex && (
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: v.swatchHex }}
                        />
                      )}
                      <span>{v.label.split(' · ')[0].replace('Madoromi ', '').replace('Kakuno ', '')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fine vs Medium Nib Selector */}
            <div className="pt-3 border-t border-[#ECE8DF] flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#5C5852]">Nib Grade:</span>
              <div className="inline-flex items-center gap-1.5">
                {(['Fine', 'Medium'] as const).map((nib) => {
                  const active = selectedNib === nib;
                  return (
                    <button
                      key={nib}
                      type="button"
                      onClick={() => setSelectedNib(nib)}
                      className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'border-[#163A5F] bg-[#163A5F] text-white font-semibold'
                          : 'border-[#DCD5C7] bg-[#FAF8F5] text-[#524E48] hover:border-[#171614]'
                      }`}
                    >
                      {nib} ({nib === 'Fine' ? '0.35mm' : '0.50mm'})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 02: Pilot CON-40 Twist Converter */}
          <div className="lg:col-span-3 p-6 border-b lg:border-b-0 lg:border-r border-[#E6E1D8] flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center justify-between text-xs text-[#6E6A63] mb-3">
                <span className="font-semibold uppercase tracking-wider text-[#171614]">
                  02 · Twist Converter
                </span>
                <span className="font-mono-tabular font-semibold text-[#171614]">
                  {preraIncludesCon40
                    ? 'Included in Box'
                    : includeCon40
                      ? 'KES 1,200'
                      : 'Optional'}
                </span>
              </div>

              <div className="aspect-[4/3] w-full bg-[#FAF8F5] rounded border border-[#ECE8DF] p-4 flex items-center justify-center mb-4">
                <img
                  src={resolveAssetUrl(con40Product.image)}
                  alt={con40Product.name}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-contain transition-opacity ${
                    preraIncludesCon40 || includeCon40 ? 'opacity-100' : 'opacity-40'
                  }`}
                />
              </div>

              <h4 className="text-sm font-semibold text-[#171614]">
                Pilot CON-40 Fountain Pen Twist Converter
              </h4>
              <p className="text-xs text-[#5C5852] mt-1.5 leading-relaxed">
                Genuine Pilot screw-piston reservoir with 4 stainless-steel agitator beads.
                Allows any Kakuno or Prera to draw bottled ink directly from the flacon and unlocks the <strong>5% bundle discount</strong>.
              </p>
            </div>

            <div className="pt-3 mt-4 border-t border-[#ECE8DF]">
              {preraIncludesCon40 ? (
                <div className="w-full py-2 px-3 text-xs font-semibold rounded border border-[#1D5B43]/30 bg-[#1D5B43]/10 text-[#1D5B43] flex items-center justify-center gap-2">
                  <Check className="w-3.5 h-3.5" />
                  <span>Included Free with Prera</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIncludeCon40((prev) => !prev)}
                  className={`w-full py-2 px-3 text-xs font-semibold rounded border flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                    includeCon40
                      ? 'border-[#163A5F] bg-[#163A5F]/10 text-[#163A5F]'
                      : 'border-[#DCD5C7] bg-[#FAF8F5] text-[#524E48] hover:border-[#171614]'
                  }`}
                >
                  {includeCon40 ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>CON-40 Included · KES 1,200</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Include CON-40 · Unlock 5% OFF</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Step 03: 50ml Bottled Ink (Waterman KES 2,000 or Iroshizuku KES 6,000) */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center justify-between text-xs text-[#6E6A63] mb-3">
                <span className="font-semibold uppercase tracking-wider text-[#171614]">
                  03 · 50ml Bottled Ink
                </span>
                <span className="font-mono-tabular font-semibold text-[#171614]">
                  {formatKes(activeInkProduct.priceKes)}
                </span>
              </div>

              {/* Switch between Waterman Paris (KES 2,000) & Pilot Iroshizuku (KES 6,000) */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setInkLine('waterman')}
                  className={`p-2.5 rounded border text-left transition-colors cursor-pointer ${
                    inkLine === 'waterman'
                      ? 'border-[#163A5F] bg-[#163A5F]/8 text-[#171614]'
                      : 'border-[#E6E1D8] bg-[#FAF8F5] text-[#5C5852]'
                  }`}
                >
                  <div className="text-xs font-semibold text-[#171614]">
                    Waterman Paris (50ml)
                  </div>
                  <div className="font-mono-tabular text-[11px] text-[#163A5F]">
                    KES 2,000 · 3 Classic Shades
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setInkLine('iroshizuku')}
                  className={`p-2.5 rounded border text-left transition-colors cursor-pointer ${
                    inkLine === 'iroshizuku'
                      ? 'border-[#163A5F] bg-[#163A5F]/8 text-[#171614]'
                      : 'border-[#E6E1D8] bg-[#FAF8F5] text-[#5C5852]'
                  }`}
                >
                  <div className="text-xs font-semibold text-[#171614]">
                    Pilot Iroshizuku (50ml)
                  </div>
                  <div className="font-mono-tabular text-[11px] text-[#163A5F]">
                    KES 6,000 · 15 Shades In Stock
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-5 aspect-square bg-[#FAF8F5] rounded border border-[#ECE8DF] p-3 flex items-center justify-center">
                  <img
                    src={resolveAssetUrl(activeInkVariant.image || activeInkProduct.image)}
                    alt={activeInkVariant.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="sm:col-span-7">
                  <p className="text-xs font-semibold text-[#171614]">
                    {activeInkVariant.label}
                  </p>
                  <p className="text-[11px] text-[#6E6A63] mt-0.5 leading-snug">
                    {activeInkVariant.sublabel}
                  </p>

                  {inkLine === 'waterman' ? (
                    <div className="flex flex-col gap-1.5 mt-3">
                      {watermanProduct.variants.map((v) => {
                        const active = v.id === selectedWatermanVariantId;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setSelectedWatermanVariantId(v.id)}
                            className={`px-2.5 py-1.5 rounded border text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                              active
                                ? 'border-[#163A5F] bg-[#163A5F] text-white font-medium'
                                : 'border-[#E6E1D8] bg-[#FAF8F5] text-[#524E48] hover:border-[#171614]'
                            }`}
                          >
                            <span
                              className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                              style={{ backgroundColor: v.swatchHex }}
                            />
                            <span className="truncate">{v.label.split(' · ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-6 gap-1.5 mt-3 max-h-[108px] overflow-y-auto p-1 bg-[#FAF8F5] rounded border border-[#ECE8DF]">
                      {INK_STUDIO_SHADES.map((shade) => {
                        const active = shade.id === selectedIroshizukuVariantId;
                        const shadeStock = IROSHIZUKU_INITIAL_STOCK_MAP[shade.id] ?? 0;
                        return (
                          <button
                            key={shade.id}
                            type="button"
                            disabled={shadeStock === 0}
                            onClick={() => setSelectedIroshizukuVariantId(shade.id)}
                            title={`${shade.name} (${shade.meaning}) — ${
                              shadeStock > 0 ? `${shadeStock} in stock` : 'Out of Stock · Add to Wishlist'
                            }`}
                            className={`p-1 rounded flex flex-col items-center ${
                              shadeStock === 0
                                ? 'opacity-35 cursor-not-allowed'
                                : active
                                  ? 'bg-white ring-1 ring-[#163A5F] cursor-pointer'
                                  : 'hover:bg-white cursor-pointer'
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-black/20"
                              style={{ backgroundColor: shade.hex }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bundle Summary & 1-Click Add Bar */}
            <div className="pt-4 mt-4 border-t border-[#ECE8DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-[#6E6A63] block">
                  {activePenVariant.label.split(' · ')[0]} ({selectedNib})
                  {hasCompleteBundle ? ' + CON-40' : ''} +{' '}
                  {activeInkVariant.label.split(' · ')[0]}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono-tabular text-lg font-bold text-[#171614]">
                    {formatKes(bundleTotalKes)}
                  </span>
                  {hasCompleteBundle && (
                    <>
                      <span className="font-mono-tabular text-xs line-through text-[#8C857B]">
                        {formatKes(bundleStandardTotalKes)}
                      </span>
                      <span className="text-[11px] font-semibold text-[#1D5B43]">
                        Save 5% ({formatKes(bundleDiscountKes)})
                      </span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddCompleteSet}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold tracking-wider uppercase rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  bundleAdded
                    ? 'bg-[#1D5B43] text-white'
                    : 'bg-[#163A5F] hover:bg-[#102B47] text-white'
                }`}
              >
                {bundleAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Complete Set Added (5% OFF)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E5B25D]" />
                    <span>
                      Add Writing Set · {formatKes(bundleTotalKes)}
                      {hasCompleteBundle ? ' (5% OFF)' : ''}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
