import { Bell, Check, Eye, Heart, Plus, ShoppingBag, ZoomIn } from 'lucide-react';
import { ResilientImage, VariantStockIndicator } from './primitives';
import { INK_STUDIO_SHADES, NibOption } from '../data/products';
import { CustomerReviewsIsland, StarRatingDisplay } from '../islands/CustomerReviewsIsland';
import { formatKes } from '../lib/storefront';
import { resolveAssetUrl } from '../utils/assetResolver';
import { Link } from 'react-router-dom';
import { useStorefront } from '../store/StorefrontContext';

export function ProductGrid() {
  const {
    expandedCardReviews,
    setExpandedCardReviews,
    allProductReviews,
    selectedVariants,
    setSelectedVariants,
    selectedNibs,
    activeImageByProduct,
    setActiveImageByProduct,
    setZoomModal,
    justAddedKey,
    openProduct,
    setQuickBuyProduct,
    firebaseUser,
    memberProfile,
    isSigningIn,
    filteredProducts,
    handleSelectVariant,
    handleSelectNib,
    handleAddToCart,
    isItemWishlisted,
    handleToggleWishlist,
    handleGoogleSignIn,
    handleOpenNotifyMeModal,
    handleSubmitProductReview,
    handleDeleteProductReview,
    handleQuickMemberSignInForReviews,
  } = useStorefront();
  return (
    <>
      {/* 2-Column Product Showcase Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {filteredProducts.map((product) => {
          const chosenVariantId =
            selectedVariants[product.id] || product.variants[0].id;
          const chosenVariant =
            product.variants.find((v) => v.id === chosenVariantId) ||
            product.variants[0];
          const chosenNib: NibOption = selectedNibs[product.id] || 'Fine';
          const displayedImage =
            activeImageByProduct[product.id] ||
            chosenVariant.image ||
            product.image;
          const isContainImage =
            product.imageFit === 'contain' ||
            displayedImage.includes('madoromi_ivory') ||
            displayedImage.includes('madoromi_blue') ||
            displayedImage.includes('madoromi_pink') ||
            displayedImage.includes('madoromi_brown') ||
            displayedImage.includes('madoromi_lightblue') ||
            displayedImage.includes('madoromi_nib_detail');
          const feedbackKey = `${product.id}-${chosenVariant.id}-${
            product.hasNibSelector ? chosenNib : 'none'
          }`;
          const isAdded = justAddedKey === feedbackKey;
          const isWishlisted = isItemWishlisted(product.id, chosenVariant.id);

          return (
            <article
              key={product.id}
              className="group bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div>
                {/* Product Image Slot (4:3 Uniform Aspect Ratio) */}
                <div
                  className={`relative aspect-[4/3] w-full overflow-hidden border-b border-[#E6E1D8] ${
                    isContainImage ? 'bg-white p-4' : 'bg-[#EFECE5]'
                  }`}
                >
                  <ResilientImage
                    src={displayedImage}
                    alt={`${product.name} — ${chosenVariant.label}`}
                    fallbackTitle={product.name}
                    className={`w-full h-full transition-transform duration-300 group-hover:scale-[1.02] ${
                      isContainImage ? 'object-contain' : 'object-cover'
                    }`}
                  />

                  {/* Gallery Thumbnail Switcher for Multi-Image Series */}
                  {product.galleryImages && product.galleryImages.length > 1 && (
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 bg-[#FAF8F5]/95 p-1.5 rounded border border-[#E6E1D8] w-fit max-w-[calc(100%-1.5rem)] overflow-x-auto">
                      {product.galleryImages.slice(0, 7).map((imgItem, idx) => {
                        const isCurrentImg = displayedImage === imgItem.src;
                        return (
                          <button
                            key={imgItem.src}
                            type="button"
                            onClick={() => {
                              setActiveImageByProduct((prev) => ({
                                ...prev,
                                [product.id]: imgItem.src,
                              }));
                              // If this thumbnail matches a variant's image, also sync the variant selection
                              const matchingVar = product.variants.find(
                                (v) => v.image === imgItem.src
                              );
                              if (matchingVar) {
                                setSelectedVariants((prev) => ({
                                  ...prev,
                                  [product.id]: matchingVar.id,
                                }));
                              }
                            }}
                            title={imgItem.caption}
                            className={`w-8 h-8 rounded overflow-hidden border transition-all cursor-pointer shrink-0 bg-white ${
                              isCurrentImg
                                ? 'border-[#163A5F] ring-1 ring-[#163A5F]'
                                : 'border-[#DCD5C7] opacity-75 hover:opacity-100'
                            }`}
                          >
                            <img
                              loading="lazy"
                              decoding="async"
                              src={resolveAssetUrl(imgItem.src, 'small')}
                              alt={imgItem.caption}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain"
                            />
                            <span className="sr-only">View photo {idx + 1}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const matchedInk =
                        product.id === 'pilot-iroshizuku-ink'
                          ? INK_STUDIO_SHADES.find((s) => s.id === chosenVariant.id)
                          : undefined;
                      setZoomModal({
                        src: displayedImage,
                        secondarySrc: matchedInk?.swatchImage,
                        activeView: 'primary',
                        title: `${product.name} — ${chosenVariant.label}`,
                        subtitle: chosenVariant.sublabel,
                        swatchHex: chosenVariant.swatchHex,
                        inkShadeId: matchedInk?.id,
                        zoomLevel: 2,
                        panX: 50,
                        panY: 50,
                      });
                    }}
                    title="Zoom & Inspect High-Resolution Photo"
                    className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-[#FAF8F5]/95 text-[#171614] hover:bg-[#0A2246] hover:text-white rounded border border-[#E6E1D8] transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Zoom</span>
                  </button>

                  {chosenVariant.swatchHex && (
                    <span
                      title={chosenVariant.label}
                      className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full border border-black/20 shadow-xs"
                      style={{ backgroundColor: chosenVariant.swatchHex }}
                    />
                  )}
                </div>

                {/* Card Body: Unboxed Metadata + Product Name + Tabular KES Price */}
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E6A63] mb-2">
                    <span className="uppercase tracking-wider">{product.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{product.Origin}</span>
                    <span aria-hidden="true">·</span>
                    <VariantStockIndicator
                      stockCount={chosenVariant.stockCount}
                      availabilityLabel={product.availability}
                    />
                  </div>

                  <div className="flex items-baseline justify-between gap-4 mt-1">
                    <h3 className="text-lg font-semibold tracking-tight text-[#171614]">
                      {product.name}
                    </h3>
                    <span className="font-mono-tabular text-base font-semibold text-[#171614] whitespace-nowrap shrink-0">
                      {formatKes(product.priceKes)}
                    </span>
                  </div>

                  <p className="text-xs text-[#6E6A63] mt-0.5">{product.japaneseTitle}</p>

                  {/* Star Rating & Review Count Summary Line */}
                  {(() => {
                    const prodRevs = allProductReviews.filter(
                      (r) => r.productId === product.id
                    );
                    const avg =
                      prodRevs.length > 0
                        ? prodRevs.reduce((acc, r) => acc + r.rating, 0) /
                          prodRevs.length
                        : 5.0;
                    const isReviewsOpen = expandedCardReviews[product.id] ?? false;
                    return (
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <StarRatingDisplay rating={avg} size="xs" />
                          <span className="font-mono-tabular text-xs font-semibold text-[#0A2246]">
                            {avg.toFixed(1)}
                          </span>
                          <span className="text-xs text-[#6E6A63]">
                            · {prodRevs.length}{' '}
                            {prodRevs.length === 1 ? 'Review' : 'Reviews'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCardReviews((prev) => ({
                              ...prev,
                              [product.id]: !prev[product.id],
                            }))
                          }
                          className="text-xs font-semibold text-[#0A2246] hover:text-[#C88A2E] underline underline-offset-4 cursor-pointer whitespace-nowrap"
                        >
                          {isReviewsOpen ? 'Hide Reviews' : 'Rate & Review'}
                        </button>
                      </div>
                    );
                  })()}

                  <p className="text-sm text-[#4A4742] mt-3 leading-relaxed">
                    {product.shortSummary}
                  </p>

                  {/* Interactive Variant Picker directly on Card */}
                  <div className="mt-5 pt-4 border-t border-[#EAE5DC]">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="block text-xs font-medium text-[#5C5852]">
                        {product.variantLabel}
                      </span>
                      {product.id === 'pilot-kakuno-madoromi' && (
                        <div className="flex items-center gap-3">
                          {displayedImage !== '/assets/madoromi/madoromi_series.jpg' && (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveImageByProduct((prev) => ({
                                  ...prev,
                                  [product.id]: '/assets/madoromi/madoromi_series.jpg',
                                }))
                              }
                              className="text-[11px] font-medium text-[#163A5F] hover:underline cursor-pointer whitespace-nowrap shrink-0"
                            >
                              Show Series Photo
                            </button>
                          )}
                          <Link
                            to="/collection/madoromi"
                            className="text-[11px] font-medium text-[#163A5F] hover:underline whitespace-nowrap shrink-0"
                          >
                            View All 5 Pens One-by-One →
                          </Link>
                        </div>
                      )}
                      {product.id === 'pilot-kakuno-family' && (
                        <Link
                          to="/collection/family"
                          className="text-[11px] font-medium text-[#163A5F] hover:underline whitespace-nowrap shrink-0"
                        >
                          View All 6 Pens One-by-One →
                        </Link>
                      )}
                      {product.id === 'pilot-prera' && (
                        <Link
                          to="/collection/prera"
                          className="text-[11px] font-medium text-[#163A5F] hover:underline whitespace-nowrap shrink-0"
                        >
                          Open Empress Teal Series →
                        </Link>
                      )}
                      {product.id === 'pilot-iroshizuku-ink' && (
                        <Link
                          to="/collection/iroshizuku"
                          className="text-[11px] font-medium text-[#163A5F] hover:underline whitespace-nowrap shrink-0"
                        >
                          View All 24 Bottles →
                        </Link>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-[118px] overflow-y-auto pr-1">
                      {product.variants.map((variant) => {
                        const isSelected = variant.id === chosenVariant.id;
                        const vStock =
                          typeof variant.stockCount === 'number'
                            ? variant.stockCount
                            : 10;
                        const isLow = vStock > 0 && vStock < 3;
                        return (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() => handleSelectVariant(product.id, variant.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                              isSelected
                                ? 'border-[#163A5F] bg-[#163A5F]/8 text-[#171614] font-medium'
                                : 'border-[#E6E1D8] bg-white text-[#5C5852] hover:border-[#BDB6AA]'
                            }`}
                          >
                            {variant.swatchHex && (
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                                style={{ backgroundColor: variant.swatchHex }}
                              />
                            )}
                            <span>{variant.label.split(' · ')[0]}</span>
                            {isLow && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>{vStock} left</span>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-[#6E6A63] mt-2 min-h-[1.25rem]">
                      <span className="font-medium text-[#171614]">
                        {chosenVariant.label}:{' '}
                      </span>
                      {chosenVariant.sublabel}
                    </p>
                  </div>

                  {/* Dedicated Fine / Medium Nib Size Selector for Fountain Pens */}
                  {product.hasNibSelector && (
                    <div className="mt-4 pt-3.5 border-t border-[#EAE5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <span className="text-xs font-medium text-[#5C5852]">
                        Select Nib Option:
                      </span>
                      <div
                        role="group"
                        aria-label={`Select Nib Size for ${product.name}`}
                        className="inline-flex items-center gap-1.5"
                      >
                        {(['Fine', 'Medium'] as const).map((nib) => {
                          const isNibSelected = chosenNib === nib;
                          return (
                            <button
                              key={nib}
                              type="button"
                              onClick={() => handleSelectNib(product.id, nib)}
                              className={`px-3 py-1.5 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                isNibSelected
                                  ? 'border-[#163A5F] bg-[#163A5F] text-white font-semibold'
                                  : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#171614]'
                              }`}
                            >
                              {nib === 'Fine' ? 'Fine (0.35mm)' : 'Medium (0.50mm)'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions: Add to Bag (or Notify Me if Sold Out) + Quick Buy side-by-side + Add to Wishlist */}
              <div className="px-6 pb-6 pt-2 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {(typeof chosenVariant.stockCount === 'number'
                    ? chosenVariant.stockCount
                    : 10) === 0 ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenNotifyMeModal(
                          product,
                          chosenVariant,
                          product.hasNibSelector ? chosenNib : undefined
                        )
                      }
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold tracking-wider uppercase rounded bg-amber-700 hover:bg-amber-800 text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Bell className="w-4 h-4" />
                      <span>
                        Notify Me When Available
                        {product.hasNibSelector ? ` (${chosenNib})` : ''}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleAddToCart(
                          product,
                          chosenVariant,
                          product.hasNibSelector ? chosenNib : undefined,
                          false
                        )
                      }
                      className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold tracking-wider uppercase rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        isAdded
                          ? 'bg-[#1D5B43] text-white'
                          : 'bg-[#0A2246] hover:bg-[#133468] text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Added to Bag</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>
                            Add to Bag
                            {product.hasNibSelector ? ` (${chosenNib})` : ''} ·{' '}
                            {formatKes(product.priceKes)}
                          </span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setQuickBuyProduct(product)}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold uppercase tracking-wider rounded border border-[#0A2246] bg-white text-[#0A2246] hover:bg-[#0A2246] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#C88A2E]" />
                    <span>Quick Buy</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleWishlist(
                        product,
                        chosenVariant,
                        product.hasNibSelector ? chosenNib : undefined
                      )
                    }
                    aria-pressed={isWishlisted}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3.5 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                      isWishlisted
                        ? 'border-[#C88A2E] bg-[#C88A2E]/12 text-[#0A2246]'
                        : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246]'
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isWishlisted ? 'fill-[#C88A2E] text-[#C88A2E]' : ''
                      }`}
                    />
                    <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openProduct(product)}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 text-xs font-medium rounded border border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Full Details &amp; Reviews</span>
                  </button>
                </div>

                {/* Expandable Customer Reviews Component directly on Product Card */}
                {expandedCardReviews[product.id] && (
                  <CustomerReviewsIsland
                    product={product}
                    reviews={allProductReviews}
                    currentUser={
                      memberProfile
                        ? {
                            uid: firebaseUser?.uid || memberProfile.uid,
                            name: memberProfile.name,
                            emailOrPhone: memberProfile.emailOrPhone,
                            isFirebaseAuthenticated: Boolean(firebaseUser),
                          }
                        : null
                    }
                    isSigningIn={isSigningIn}
                    onGoogleSignIn={handleGoogleSignIn}
                    onQuickMemberSignIn={handleQuickMemberSignInForReviews}
                    onSubmitReview={handleSubmitProductReview}
                    onDeleteReview={handleDeleteProductReview}
                    compact={true}
                  />
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
