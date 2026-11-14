import React, { useMemo, useState } from 'react';
import {
  Check,
  ZoomIn,
  Plus,
  ShoppingBag,
  Heart,
  Bell,
  MessageSquare,
  Feather,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Product,
  ProductVariant,
  NibOption,
  INK_STUDIO_SHADES,
} from '../data/products';
import { resolveAssetUrl } from '../utils/assetResolver';
import {
  CustomerReviewsIsland,
  ProductReviewRecord,
  StarRatingDisplay,
} from './CustomerReviewsIsland';

interface UniformProductPageIslandProps {
  product: Product;
  selectedVariantId: string;
  selectedNib: NibOption;
  activeImageSrc?: string;
  justAddedKey: string | null;
  isWishlisted: boolean;
  reviews: ProductReviewRecord[];
  currentUser: {
    uid: string;
    name: string;
    emailOrPhone: string;
    isFirebaseAuthenticated: boolean;
  } | null;
  isSigningIn: boolean;
  onSelectVariant: (productId: string, variantId: string) => void;
  onSelectImage: (productId: string, imageSrc: string) => void;
  onSelectNib: (productId: string, nib: NibOption) => void;
  onOpenZoom: (payload: {
    src: string;
    secondarySrc?: string;
    activeView: 'primary' | 'secondary';
    title: string;
    subtitle: string;
    swatchHex?: string;
    inkShadeId?: string;
  }) => void;
  onAddToCart: (
    product: Product,
    variant: ProductVariant,
    nib?: NibOption,
    openDrawer?: boolean,
    customFeedbackKey?: string
  ) => void;
  onQuickBuy: (product: Product) => void;
  onNotifyMe: (product: Product, variant: ProductVariant, nib?: NibOption) => void;
  onToggleWishlist: (
    product: Product,
    variant: ProductVariant,
    nib?: NibOption
  ) => void;
  onGoogleSignIn: () => Promise<void>;
  onQuickMemberSignIn: (name: string, contact: string) => void;
  onSubmitReview: (payload: {
    productId: string;
    rating: number;
    comment: string;
    variantLabel: string;
    authorLocation: string;
  }) => Promise<void>;
  onDeleteReview?: (review: ProductReviewRecord) => Promise<void>;
}

function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

function StockStatusLine({
  stockCount,
  availabilityLabel,
}: {
  stockCount?: number;
  availabilityLabel?: string;
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
        <span>Low Stock · Only {count} left in Nairobi</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[#1D5B43] font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-[#1D5B43] shrink-0" />
      <span>
        {availabilityLabel
          ? `${availabilityLabel} (${count} in stock)`
          : `${count} in stock`}
      </span>
    </span>
  );
}

export const UniformProductPageIsland: React.FC<UniformProductPageIslandProps> = ({
  product,
  selectedVariantId,
  selectedNib,
  activeImageSrc,
  justAddedKey,
  isWishlisted,
  reviews,
  currentUser,
  isSigningIn,
  onSelectVariant,
  onSelectImage,
  onSelectNib,
  onOpenZoom,
  onAddToCart,
  onQuickBuy,
  onNotifyMe,
  onToggleWishlist,
  onGoogleSignIn,
  onQuickMemberSignIn,
  onSubmitReview,
  onDeleteReview,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const selectedVariant = useMemo(() => {
    return (
      product.variants.find((v) => v.id === selectedVariantId) ||
      product.variants[0]
    );
  }, [product.variants, selectedVariantId]);

  const galleryItems = useMemo(() => {
    const items: { src: string; caption: string }[] = [];
    const seen = new Set<string>();

    if (product.galleryImages && product.galleryImages.length > 0) {
      product.galleryImages.forEach((g) => {
        if (g.src && !seen.has(g.src)) {
          seen.add(g.src);
          items.push(g);
        }
      });
    }

    product.variants.forEach((v) => {
      if (v.image && !seen.has(v.image)) {
        seen.add(v.image);
        items.push({ src: v.image, caption: v.label });
      }
    });

    if (items.length === 0 && product.image) {
      items.push({ src: product.image, caption: product.name });
    }

    return items;
  }, [product]);

  const displayedImage =
    activeImageSrc || selectedVariant?.image || product.image;

  const isContainImage =
    product.imageFit === 'contain' ||
    displayedImage.includes('madoromi_ivory') ||
    displayedImage.includes('madoromi_blue') ||
    displayedImage.includes('madoromi_pink') ||
    displayedImage.includes('madoromi_brown') ||
    displayedImage.includes('madoromi_lightblue') ||
    displayedImage.includes('madoromi_nib_detail');

  const matchedInkShade =
    product.id === 'pilot-iroshizuku-ink'
      ? INK_STUDIO_SHADES.find((s) => s.id === selectedVariant?.id)
      : undefined;

  const productReviews = useMemo(
    () => reviews.filter((r) => r.productId === product.id),
    [reviews, product.id]
  );

  const avgRating = useMemo(() => {
    if (productReviews.length === 0) return 5.0;
    return (
      productReviews.reduce((acc, r) => acc + r.rating, 0) /
      productReviews.length
    );
  }, [productReviews]);

  const stockCount =
    typeof selectedVariant?.stockCount === 'number'
      ? selectedVariant.stockCount
      : 10;

  const feedbackKey = `pdp-uniform-${product.id}-${selectedVariant.id}-${
    product.hasNibSelector ? selectedNib : 'none'
  }`;
  const isAdded = justAddedKey === feedbackKey;
  const shortVariantName = selectedVariant.label.split(' · ')[0];

  const handleTriggerZoom = () => {
    onOpenZoom({
      src: displayedImage,
      secondarySrc: matchedInkShade?.swatchImage,
      activeView: 'primary',
      title: `${product.name} — ${shortVariantName}${
        product.hasNibSelector ? ` (${selectedNib} Nib)` : ''
      }`,
      subtitle: selectedVariant.sublabel,
      swatchHex: selectedVariant.swatchHex,
      inkShadeId: matchedInkShade?.id,
    });
  };

  return (
    <div className="bg-[#FAF8F5] border border-[#DCD5C7] rounded-lg overflow-hidden shadow-xs mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* LEFT COLUMN: Multi-Angle Studio Gallery & Box Contents */}
        <div className="lg:col-span-6 bg-white border-b lg:border-b-0 lg:border-r border-[#E6E1D8] p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#0A2246]">
                {selectedVariant.swatchHex && (
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: selectedVariant.swatchHex }}
                  />
                )}
                <span className="truncate">{selectedVariant.label}</span>
              </span>

              <button
                type="button"
                onClick={handleTriggerZoom}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#FAF8F5] text-[#171614] hover:bg-[#0A2246] hover:text-white rounded border border-[#DCD5C7] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Zoom 3×</span>
              </button>
            </div>

            {/* Main Interactive Photo Stage */}
            <div
              onClick={handleTriggerZoom}
              className="aspect-square max-h-[380px] w-full mx-auto flex items-center justify-center p-4 cursor-zoom-in"
            >
              {imgFailed ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#F2EFE9] to-[#E5DFD3] text-[#3F3D39] rounded p-6 text-center">
                  <Feather className="w-8 h-8 mb-2 stroke-[1.25] text-[#163A5F]" />
                  <span className="font-serif-display text-lg font-medium">
                    {product.name}
                  </span>
                  <span className="text-xs text-[#6E6A63] mt-1">
                    {selectedVariant.label}
                  </span>
                </div>
              ) : (
                <img
                  src={resolveAssetUrl(displayedImage)}
                  alt={`${product.name} — ${selectedVariant.label}`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className={`w-full h-full transition-transform duration-200 hover:scale-[1.03] ${
                    isContainImage ? 'object-contain' : 'object-cover rounded'
                  }`}
                />
              )}
            </div>

            {/* Studio Angles & Finish Thumbnails */}
            {galleryItems.length > 1 && (
              <div className="mt-4 pt-4 border-t border-[#ECE8DF]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63] mb-2.5">
                  Inspect All {galleryItems.length} Studio Angles &amp; Finishes
                </p>
                <div className="flex flex-wrap gap-2 max-h-[112px] overflow-y-auto pr-1">
                  {galleryItems.map((imgItem, idx) => {
                    const isCurrent = displayedImage === imgItem.src;
                    return (
                      <button
                        key={`${imgItem.src}-${idx}`}
                        type="button"
                        onClick={() => {
                          setImgFailed(false);
                          onSelectImage(product.id, imgItem.src);
                          const matchingVariant = product.variants.find(
                            (v) => v.image === imgItem.src
                          );
                          if (matchingVariant) {
                            onSelectVariant(product.id, matchingVariant.id);
                          }
                        }}
                        title={imgItem.caption}
                        className={`w-12 h-12 rounded border p-1 bg-white overflow-hidden transition-all cursor-pointer shrink-0 ${
                          isCurrent
                            ? 'border-[#0A2246] ring-1 ring-[#0A2246]'
                            : 'border-[#DCD5C7] opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={resolveAssetUrl(imgItem.src)}
                          alt={imgItem.caption}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                        <span className="sr-only">View {imgItem.caption}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Included in the Presentation Box */}
          <div className="mt-6 p-4 rounded bg-[#F3EFE8] border border-[#E6E1D8]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0A2246] mb-2">
              Included in the Presentation Box
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#3F3D39]">
              {product.includedItems.map((inc) => (
                <li key={inc} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1D5B43] shrink-0 mt-0.5" />
                  <span>{inc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: Editorial Story, Interactive Configurator, Specs & Contiguous Purchase Module */}
        <div className="lg:col-span-6 p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E6A63] mb-2">
              <span className="uppercase tracking-wider font-semibold text-[#B58435]">
                {product.category} · {product.Origin}
              </span>
              <span aria-hidden="true">·</span>
              <StockStatusLine
                stockCount={selectedVariant.stockCount}
                availabilityLabel={product.availability}
              />
            </div>

            <div className="flex items-baseline justify-between gap-4">
              <h4 className="font-serif-display text-2xl lg:text-3xl font-semibold text-[#0A2246]">
                {product.name}
              </h4>
              <span className="font-mono-tabular text-2xl font-bold text-[#0A2246] shrink-0">
                {formatKes(product.priceKes)}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-[#6E6A63]">{product.japaneseTitle}</p>
              <button
                type="button"
                onClick={() => setShowReviews((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0A2246] hover:text-[#B58435] cursor-pointer"
              >
                <StarRatingDisplay rating={avgRating} size="xs" />
                <span className="font-mono-tabular font-semibold">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-[#6E6A63]">
                  ({productReviews.length}{' '}
                  {productReviews.length === 1 ? 'Review' : 'Reviews'})
                </span>
              </button>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-[#4A4742] leading-relaxed">
              {product.description}
            </p>

            {/* Variant / Finish / Shade Selector */}
            <div className="mt-5 pt-4 border-t border-[#E6E1D8]">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0A2246]">
                  {product.variantLabel}
                </span>
                <span className="text-xs text-[#6E6A63] font-medium">
                  {shortVariantName}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-[124px] overflow-y-auto pr-1">
                {product.variants.map((variant) => {
                  const isSelected = variant.id === selectedVariant.id;
                  const vStock =
                    typeof variant.stockCount === 'number'
                      ? variant.stockCount
                      : 10;
                  const isLow = vStock > 0 && vStock < 3;
                  const isOut = vStock === 0;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => {
                        setImgFailed(false);
                        onSelectVariant(product.id, variant.id);
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        isSelected
                          ? 'border-[#0A2246] bg-[#0A2246] text-white font-semibold'
                          : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246]'
                      }`}
                    >
                      {variant.swatchHex && (
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                          style={{ backgroundColor: variant.swatchHex }}
                        />
                      )}
                      <span>{variant.label.split(' · ')[0]}</span>
                      {isOut && (
                        <span
                          className={`text-[10px] font-semibold ${
                            isSelected ? 'text-rose-200' : 'text-rose-700'
                          }`}
                        >
                          Out
                        </span>
                      )}
                      {isLow && (
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold animate-pulse ${
                            isSelected ? 'text-amber-200' : 'text-amber-700'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>{vStock} left</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-[#5C5852] mt-2 leading-relaxed">
                <span className="font-semibold text-[#171614]">
                  {selectedVariant.label}:{' '}
                </span>
                {selectedVariant.sublabel}
              </p>
            </div>

            {/* Nib Selector when Applicable */}
            {product.hasNibSelector && (
              <div className="mt-5 pt-4 border-t border-[#E6E1D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#0A2246]">
                    Select Nib Size
                  </span>
                  <span className="text-[11px] text-[#6E6A63]">
                    {selectedVariant.nibEngraving ||
                      'Precision Japanese Stainless Steel Nib'}
                  </span>
                </div>
                <div className="inline-flex items-center gap-2">
                  {(['Fine', 'Medium'] as const).map((nib) => {
                    const selected = selectedNib === nib;
                    return (
                      <button
                        key={nib}
                        type="button"
                        onClick={() => onSelectNib(product.id, nib)}
                        className={`px-4 py-2 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          selected
                            ? 'border-[#0A2246] bg-[#0A2246] text-white font-semibold'
                            : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246]'
                        }`}
                      >
                        {nib === 'Fine' ? 'Fine (0.35mm)' : 'Medium (0.50mm)'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Complete Technical Specifications Table */}
            <div className="mt-5 pt-4 border-t border-[#E6E1D8]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5C5852] mb-2.5">
                {product.name} — Technical Specifications
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                {product.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-baseline justify-between gap-2 py-1 border-b border-[#ECE8DF]"
                  >
                    <span className="text-[#6E6A63] shrink-0">{spec.label}</span>
                    <span className="font-medium text-[#171614] text-right">
                      {spec.value}
                    </span>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-2 py-1 border-b border-[#ECE8DF]">
                  <span className="text-[#6E6A63] shrink-0">Active Edition</span>
                  <span className="font-medium text-[#171614] text-right">
                    {shortVariantName}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2 py-1 border-b border-[#ECE8DF]">
                  <span className="text-[#6E6A63] shrink-0">Origin</span>
                  <span className="font-medium text-[#171614] text-right">
                    {product.Origin}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Purchase Actions: Add to Bag (or Notify Me) + Quick Buy + Wishlist + Reviews */}
          <div className="mt-6 pt-4 border-t border-[#E6E1D8] flex flex-col gap-2.5">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              {stockCount === 0 ? (
                <button
                  type="button"
                  onClick={() =>
                    onNotifyMe(
                      product,
                      selectedVariant,
                      product.hasNibSelector ? selectedNib : undefined
                    )
                  }
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 text-xs font-semibold tracking-wider uppercase rounded bg-amber-700 hover:bg-amber-800 text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Bell className="w-4 h-4" />
                  <span>
                    Notify Me — {shortVariantName}
                    {product.hasNibSelector ? ` (${selectedNib})` : ''}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    onAddToCart(
                      product,
                      selectedVariant,
                      product.hasNibSelector ? selectedNib : undefined,
                      true,
                      feedbackKey
                    )
                  }
                  className={`flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 text-xs font-semibold tracking-wider uppercase rounded transition-colors cursor-pointer whitespace-nowrap ${
                    isAdded
                      ? 'bg-[#1D5B43] text-white'
                      : 'bg-[#0A2246] hover:bg-[#133468] text-white'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>
                        Added {shortVariantName}
                        {product.hasNibSelector ? ` (${selectedNib})` : ''}
                      </span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>
                        Add to Bag
                        {product.hasNibSelector ? ` (${selectedNib} Nib)` : ''} ·{' '}
                        {formatKes(product.priceKes)}
                      </span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => onQuickBuy(product)}
                className="inline-flex items-center justify-center gap-1.5 py-3 px-4 text-xs font-semibold uppercase tracking-wider rounded border border-[#0A2246] bg-white text-[#0A2246] hover:bg-[#0A2246] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <ShoppingBag className="w-4 h-4 text-[#C88A2E]" />
                <span>Quick Buy</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onToggleWishlist(
                    product,
                    selectedVariant,
                    product.hasNibSelector ? selectedNib : undefined
                  )
                }
                aria-pressed={isWishlisted}
                className={`inline-flex items-center justify-center gap-1.5 py-3 px-4 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isWishlisted
                    ? 'border-[#C88A2E] bg-[#C88A2E]/12 text-[#0A2246]'
                    : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246]'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted ? 'fill-[#C88A2E] text-[#C88A2E]' : ''
                  }`}
                />
                <span>{isWishlisted ? 'In Wishlist' : 'Wishlist'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowReviews((prev) => !prev)}
              className="w-full inline-flex items-center justify-between px-4 py-2 text-xs font-semibold text-[#0A2246] bg-white hover:bg-[#F3EFE8] rounded border border-[#DCD5C7] transition-colors cursor-pointer"
            >
              <span className="inline-flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#C88A2E]" />
                <span>
                  Customer Reviews &amp; Ratings ({productReviews.length})
                </span>
              </span>
              {showReviews ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Customer Reviews Drawer inside the Uniform Product Page */}
      {showReviews && (
        <div className="p-6 lg:p-8 border-t border-[#DCD5C7] bg-white">
          <CustomerReviewsIsland
            product={product}
            reviews={reviews}
            currentUser={currentUser}
            isSigningIn={isSigningIn}
            onGoogleSignIn={onGoogleSignIn}
            onQuickMemberSignIn={onQuickMemberSignIn}
            onSubmitReview={onSubmitReview}
            onDeleteReview={onDeleteReview}
          />
        </div>
      )}
    </div>
  );
};

export default UniformProductPageIsland;
