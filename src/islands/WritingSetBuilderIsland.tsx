import React, { useState, useMemo } from 'react';
import { Check, Plus, Sparkles } from 'lucide-react';
import {
  FEATURED_PRODUCTS,
  INK_STUDIO_SHADES,
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

  // Step 3: Bottled Ink Selection ('waterman' KES 2,000 or 'iroshizuku' KES 7,500)
  const [inkLine, setInkLine] = useState<'waterman' | 'iroshizuku'>('waterman');
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
  const bundleTotalKes =
    activePenProduct.priceKes +
    (!preraIncludesCon40 && includeCon40 ? con40Product.priceKes : 0) +
    activeInkProduct.priceKes;

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
    setSelectedPenVariantId(prod.variants[0].id);
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
    <div id="writing-set-builder" className="mt-14 pt-12 border-t border-line">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] uppercase text-ink-soft mb-2">
            Bespoke Desk Curation · Fountain Pen + Twist Converter + 50ml Bottled Ink
          </p>
          <h3
            className="font-serif-display text-2xl lg:text-4xl font-semibold text-ink tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Build Your Complete Fountain Pen Writing Set
          </h3>
          <p className="text-sm text-ink-soft mt-2 max-w-2xl">
            Assemble a ready-to-write bottled ink kit in three steps: select your Pilot
            fountain pen and nib width, pair the <strong>Pilot CON-40 Twist Converter (KES 1,200)</strong>,
            and choose a 50ml bottle of <strong>Waterman Paris (KES 2,000)</strong> or{' '}
            <strong>Pilot Iroshizuku (KES 6,000)</strong>.
          </p>
        </div>
        <span className="font-mono-tabular text-xs text-ink font-medium">
          {bundleTotalKes >= 6000
            ? 'Qualifies for Complimentary Nationwide Kenya Courier'
            : 'Complimentary Same-Day Nairobi Courier'}
        </span>
      </div>

      <div className="bg-paper border border-line rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Step 01: Fountain Pen & Nib */}
          <div className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-line flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center justify-between text-xs text-ink-soft mb-3">
                <span className="font-semibold uppercase tracking-wider text-ink">
                  01 · Fountain Pen &amp; Nib
                </span>
                <span className="font-mono-tabular font-semibold text-ink">
                  {formatKes(activePenProduct.priceKes)}
                </span>
              </div>

              <div className="aspect-[4/3] w-full bg-paper rounded border border-line p-4 flex items-center justify-center mb-4">
                <img
                  loading="lazy"
                  decoding="async"
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
                          ? 'border-ink bg-ink/8 text-ink'
                          : 'border-line bg-paper text-ink-soft hover:border-faint'
                      }`}
                    >
                      <div className="text-xs font-semibold truncate">{s.label}</div>
                      <div className="font-mono-tabular text-xs text-ink-soft">
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
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedPenVariantId(v.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'border-ink bg-ink text-white font-medium'
                          : 'border-line bg-paper text-ink-soft hover:border-ink'
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
            <div className="pt-3 border-t border-line flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-ink-soft">Nib Grade:</span>
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
                          ? 'border-ink bg-ink text-white font-semibold'
                          : 'border-line bg-paper text-ink-soft hover:border-ink'
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
          <div className="lg:col-span-3 p-6 border-b lg:border-b-0 lg:border-r border-line flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center justify-between text-xs text-ink-soft mb-3">
                <span className="font-semibold uppercase tracking-wider text-ink">
                  02 · Twist Converter
                </span>
                <span className="font-mono-tabular font-semibold text-ink">
                  {preraIncludesCon40
                    ? 'Included in Box'
                    : includeCon40
                      ? 'KES 1,200'
                      : 'Optional'}
                </span>
              </div>

              <div className="aspect-[4/3] w-full bg-paper rounded border border-line p-4 flex items-center justify-center mb-4">
                <img
                  loading="lazy"
                  decoding="async"
                  src={resolveAssetUrl(con40Product.image)}
                  alt={con40Product.name}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-contain transition-opacity ${
                    preraIncludesCon40 || includeCon40 ? 'opacity-100' : 'opacity-40'
                  }`}
                />
              </div>

              <h4 className="text-sm font-semibold text-ink">
                Pilot CON-40 Fountain Pen Twist Converter
              </h4>
              <p className="text-xs text-ink-soft mt-1.5 leading-relaxed">
                Genuine Pilot screw-piston reservoir with 4 stainless-steel agitator beads.
                Allows any Kakuno or Prera to draw bottled ink directly from the flacon.
              </p>
            </div>

            <div className="pt-3 mt-4 border-t border-line">
              {preraIncludesCon40 ? (
                <div className="w-full py-2 px-3 text-xs font-semibold rounded border border-ok/30 bg-ok/10 text-ok flex items-center justify-center gap-2">
                  <Check className="w-3.5 h-3.5" />
                  <span>Included Free with Prera</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIncludeCon40((prev) => !prev)}
                  className={`w-full py-2 px-3 text-xs font-semibold rounded border flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                    includeCon40
                      ? 'border-ink bg-ink/10 text-ink'
                      : 'border-line bg-paper text-ink-soft hover:border-ink'
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
                      <span>Include CON-40 · KES 1,200</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Step 03: 50ml Bottled Ink (Waterman KES 2,000 or Iroshizuku KES 7,500) */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center justify-between text-xs text-ink-soft mb-3">
                <span className="font-semibold uppercase tracking-wider text-ink">
                  03 · 50ml Bottled Ink
                </span>
                <span className="font-mono-tabular font-semibold text-ink">
                  {formatKes(activeInkProduct.priceKes)}
                </span>
              </div>

              {/* Switch between Waterman Paris (KES 2,000) & Pilot Iroshizuku (KES 7,500) */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setInkLine('waterman')}
                  className={`p-2.5 rounded border text-left transition-colors cursor-pointer ${
                    inkLine === 'waterman'
                      ? 'border-ink bg-ink/8 text-ink'
                      : 'border-line bg-paper text-ink-soft'
                  }`}
                >
                  <div className="text-xs font-semibold text-ink">
                    Waterman Paris (50ml)
                  </div>
                  <div className="font-mono-tabular text-xs text-ink">
                    KES 2,000 · 3 Classic Shades
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setInkLine('iroshizuku')}
                  className={`p-2.5 rounded border text-left transition-colors cursor-pointer ${
                    inkLine === 'iroshizuku'
                      ? 'border-ink bg-ink/8 text-ink'
                      : 'border-line bg-paper text-ink-soft'
                  }`}
                >
                  <div className="text-xs font-semibold text-ink">
                    Pilot Iroshizuku (50ml)
                  </div>
                  <div className="font-mono-tabular text-xs text-ink">
                    KES 6,000 · All 24 Shades
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-5 aspect-square bg-paper rounded border border-line p-3 flex items-center justify-center">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={resolveAssetUrl(activeInkVariant.image || activeInkProduct.image)}
                    alt={activeInkVariant.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="sm:col-span-7">
                  <p className="text-xs font-semibold text-ink">
                    {activeInkVariant.label}
                  </p>
                  <p className="text-xs text-ink-soft mt-0.5 leading-snug">
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
                                ? 'border-ink bg-ink text-white font-medium'
                                : 'border-line bg-paper text-ink-soft hover:border-ink'
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
                    <div className="grid grid-cols-6 gap-1.5 mt-3 max-h-[108px] overflow-y-auto p-1 bg-paper rounded border border-line">
                      {INK_STUDIO_SHADES.map((shade) => {
                        const active = shade.id === selectedIroshizukuVariantId;
                        return (
                          <button
                            key={shade.id}
                            type="button"
                            onClick={() => setSelectedIroshizukuVariantId(shade.id)}
                            title={`${shade.name} (${shade.meaning})`}
                            className={`p-1 rounded flex flex-col items-center cursor-pointer ${
                              active ? 'bg-white ring-1 ring-ink' : 'hover:bg-white'
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
            <div className="pt-4 mt-4 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-ink-soft block">
                  {activePenVariant.label.split(' · ')[0]} ({selectedNib})
                  {includeCon40 ? ' + CON-40' : ''} +{' '}
                  {activeInkVariant.label.split(' · ')[0]}
                </span>
                <span className="font-mono-tabular text-lg font-semibold text-ink">
                  {formatKes(bundleTotalKes)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddCompleteSet}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold tracking-wider uppercase rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  bundleAdded
                    ? 'bg-ok text-white'
                    : 'bg-ink hover:bg-ink text-white'
                }`}
              >
                {bundleAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Complete Set Added</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Add Writing Set · {formatKes(bundleTotalKes)}</span>
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
