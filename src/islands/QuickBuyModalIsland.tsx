import React, { useState, useEffect } from 'react';
import {
  Check,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { NibOption, Product, ProductVariant } from '../data/products';
import { resolveAssetUrl } from '../utils/assetResolver';

interface QuickBuyModalIslandProps {
  product: Product | null;
  initialVariantId: string;
  initialNibSize: NibOption;
  isWishlisted: (productId: string, variantId: string) => boolean;
  onClose: () => void;
  onSelectVariantSync: (productId: string, variantId: string) => void;
  onSelectNibSync: (productId: string, nib: NibOption) => void;
  onConfirmQuickBuy: (payload: {
    product: Product;
    variant: ProductVariant;
    nibSize?: NibOption;
    quantity: number;
    includeCon40: boolean;
    openCartDrawer: boolean;
  }) => void;
  onToggleWishlist: (
    product: Product,
    variant: ProductVariant,
    nibSize?: NibOption
  ) => void;
}

function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

export function QuickBuyModalIsland({
  product,
  initialVariantId,
  initialNibSize,
  isWishlisted,
  onClose,
  onSelectVariantSync,
  onSelectNibSync,
  onConfirmQuickBuy,
  onToggleWishlist,
}: QuickBuyModalIslandProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(initialVariantId);
  const [selectedNib, setSelectedNib] = useState<NibOption>(initialNibSize);
  const [quantity, setQuantity] = useState<number>(1);
  const [includeCon40, setIncludeCon40] = useState<boolean>(false);
  const [justAdded, setJustAdded] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setSelectedVariantId(initialVariantId || product.variants[0].id);
      setSelectedNib(initialNibSize || 'Fine');
      setQuantity(1);
      setIncludeCon40(false);
      setJustAdded(false);
    }
  }, [product, initialVariantId, initialNibSize]);

  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const chosenVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const displayedImage = chosenVariant.image || product.image;
  const wishlisted = isWishlisted(product.id, chosenVariant.id);

  const unitPrice = product.priceKes;
  const canAddCon40Addon = product.hasNibSelector && product.id !== 'pilot-prera';
  const con40AddonTotal = canAddCon40Addon && includeCon40 ? 1200 : 0;
  const totalKes = unitPrice * quantity + con40AddonTotal;

  const handleVariantClick = (variantId: string) => {
    setSelectedVariantId(variantId);
    onSelectVariantSync(product.id, variantId);
  };

  const handleNibClick = (nib: NibOption) => {
    setSelectedNib(nib);
    onSelectNibSync(product.id, nib);
  };

  const handleAdd = (openDrawer: boolean) => {
    onConfirmQuickBuy({
      product,
      variant: chosenVariant,
      nibSize: product.hasNibSelector ? selectedNib : undefined,
      quantity,
      includeCon40: Boolean(canAddCon40Addon && includeCon40),
      openCartDrawer: openDrawer,
    });
    if (openDrawer) {
      onClose();
    } else {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-buy-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden shadow-2xl my-auto"
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-white border-b border-[#E6E1D8] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#6E6A63]">
            <span className="font-semibold uppercase tracking-[0.16em] text-[#0A2246]">
              Quick Buy
            </span>
            <span aria-hidden="true">·</span>
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#B58435] font-medium">{product.availability}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Quick Buy modal"
            className="p-1.5 rounded text-[#5C5852] hover:text-[#0A2246] hover:bg-[#F3EFE8] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
          {/* Left Column: Product Image Pedestal & Price Summary */}
          <div className="sm:col-span-5 flex flex-col gap-3">
            <div className="relative aspect-square w-full bg-white rounded border border-[#E6E1D8] p-4 flex items-center justify-center">
              <img
                src={resolveAssetUrl(displayedImage)}
                alt={`${product.name} — ${chosenVariant.label}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
              {chosenVariant.swatchHex && (
                <span
                  className="absolute top-3 right-3 w-5 h-5 rounded-full border border-black/20 shadow-xs"
                  style={{ backgroundColor: chosenVariant.swatchHex }}
                />
              )}
            </div>

            <div className="p-3.5 rounded bg-white border border-[#E6E1D8]">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs text-[#6E6A63]">Unit Price</span>
                <span className="font-mono-tabular text-sm font-semibold text-[#0A2246]">
                  {formatKes(product.priceKes)}
                </span>
              </div>
              {chosenVariant.nibEngraving && (
                <div className="flex items-baseline justify-between gap-2 mt-1 text-xs">
                  <span className="text-[#6E6A63]">Nib Detail</span>
                  <span className="font-medium text-[#B58435] text-right">
                    {chosenVariant.nibEngraving}
                  </span>
                </div>
              )}
              <div className="flex items-baseline justify-between gap-2 mt-2 pt-2 border-t border-[#ECE8DF]">
                <span className="text-xs font-semibold text-[#0A2246]">Total</span>
                <span className="font-mono-tabular text-base font-bold text-[#0A2246]">
                  {formatKes(totalKes)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Variant, Nib Size Selector (Fine / Medium), Quantity & Instant Add */}
          <div className="sm:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              <h2
                id="quick-buy-modal-title"
                className="font-serif-display text-2xl font-semibold text-[#0A2246]"
              >
                {product.name}
              </h2>
              <p className="text-xs text-[#6E6A63] mt-0.5">{product.japaneseTitle}</p>
            </div>

            {/* Step 1: Select Finish / Shade */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold uppercase tracking-wider text-[#5C5852]">
                  1. {product.variantLabel}
                </span>
                <span className="text-[#0A2246] font-medium truncate max-w-[180px]">
                  {chosenVariant.label.split(' · ')[0]}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-[96px] overflow-y-auto p-1 bg-white rounded border border-[#E6E1D8]">
                {product.variants.map((variant) => {
                  const active = variant.id === chosenVariant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => handleVariantClick(variant.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'border-[#0A2246] bg-[#0A2246] text-white font-medium'
                          : 'border-[#E6E1D8] bg-[#FAF8F5] text-[#524E48] hover:border-[#0A2246]'
                      }`}
                    >
                      {variant.swatchHex && (
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: variant.swatchHex }}
                        />
                      )}
                      <span>{variant.label.split(' · ')[0]}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#5C5852] mt-1.5 leading-snug">
                {chosenVariant.sublabel}
              </p>
            </div>

            {/* Step 2: Select Nib Size (Fine 0.35mm vs Medium 0.50mm) for Fountain Pens */}
            {product.hasNibSelector && (
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold uppercase tracking-wider text-[#5C5852]">
                    2. Select Nib Size
                  </span>
                  <span className="font-mono-tabular text-[11px] text-[#B58435] font-medium">
                    {selectedNib === 'Fine' ? 'Fine · 0.35mm Line' : 'Medium · 0.50mm Line'}
                  </span>
                </div>

                <div
                  role="radiogroup"
                  aria-label="Select Nib Size"
                  className="grid grid-cols-2 gap-2.5"
                >
                  {(
                    [
                      {
                        nib: 'Fine' as const,
                        mm: '0.35mm',
                        desc: 'Crisp precision for journals & ledgers',
                      },
                      {
                        nib: 'Medium' as const,
                        mm: '0.50mm',
                        desc: 'Smooth flow that showcases ink shading',
                      },
                    ] as const
                  ).map((option) => {
                    const active = selectedNib === option.nib;
                    return (
                      <button
                        key={option.nib}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => handleNibClick(option.nib)}
                        className={`p-3 rounded border text-left transition-all cursor-pointer ${
                          active
                            ? 'border-[#0A2246] bg-[#0A2246] text-white shadow-xs'
                            : 'border-[#DCD5C7] bg-white text-[#171614] hover:border-[#0A2246]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{option.nib} Nib</span>
                          <span
                            className={`font-mono-tabular text-[11px] ${
                              active ? 'text-[#E5B25D]' : 'text-[#6E6A63]'
                            }`}
                          >
                            {option.mm}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] mt-1 leading-snug ${
                            active ? 'text-white/85' : 'text-[#6E6A63]'
                          }`}
                        >
                          {option.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Quantity Stepper + Optional CON-40 Converter Pairing */}
            <div className="pt-2 border-t border-[#E6E1D8] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5C5852]">
                  Quantity
                </span>
                <div className="inline-flex items-center bg-white border border-[#DCD5C7] rounded">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="p-1.5 text-[#5C5852] hover:text-[#0A2246] cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-mono-tabular font-semibold text-[#0A2246]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                    className="p-1.5 text-[#5C5852] hover:text-[#0A2246] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {product.id === 'pilot-prera' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded border border-[#1D5B43]/30 bg-[#1D5B43]/10 text-[#1D5B43]">
                  <Check className="w-3.5 h-3.5" />
                  <span>CON-40 Converter Included in Box</span>
                </span>
              ) : canAddCon40Addon ? (
                <button
                  type="button"
                  onClick={() => setIncludeCon40((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border transition-colors cursor-pointer ${
                    includeCon40
                      ? 'border-[#C88A2E] bg-[#C88A2E]/15 text-[#0A2246] font-semibold'
                      : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246]'
                  }`}
                >
                  {includeCon40 ? (
                    <Check className="w-3.5 h-3.5 text-[#0A2246]" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-[#B58435]" />
                  )}
                  <span>Include CON-40 Converter (+KES 1,200)</span>
                </button>
              ) : null}
            </div>

            {/* Primary Quick Buy Actions */}
            <div className="pt-3 border-t border-[#E6E1D8] flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAdd(false)}
                  className={`flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold tracking-wider uppercase rounded transition-colors cursor-pointer whitespace-nowrap ${
                    justAdded
                      ? 'bg-[#1D5B43] text-white'
                      : 'bg-[#0A2246] hover:bg-[#133468] text-white'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag · {formatKes(totalKes)}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#E5B25D]" />
                      <span>
                        Add to Bag
                        {product.hasNibSelector ? ` (${selectedNib} Nib)` : ''} ·{' '}
                        {formatKes(totalKes)}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onToggleWishlist(
                      product,
                      chosenVariant,
                      product.hasNibSelector ? selectedNib : undefined
                    )
                  }
                  aria-pressed={wishlisted}
                  title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  className={`inline-flex items-center justify-center gap-1.5 py-3 px-3.5 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    wishlisted
                      ? 'border-[#C88A2E] bg-[#C88A2E]/12 text-[#0A2246]'
                      : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246]'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      wishlisted ? 'fill-[#C88A2E] text-[#C88A2E]' : ''
                    }`}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleAdd(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-semibold text-[#0A2246] bg-white hover:bg-[#F3EFE8] border border-[#DCD5C7] rounded transition-colors cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C88A2E]" />
                <span>Add &amp; Proceed Directly to Kenya Checkout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
