import { ArrowLeft, Check, Heart, ZoomIn } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ResilientImage } from '../components/primitives';
import { INK_STUDIO_SHADES } from '../data/products';
import { CustomerReviewsIsland } from '../islands/CustomerReviewsIsland';
import { formatKes } from '../lib/storefront';
import { resolveAssetUrl } from '../utils/assetResolver';
import { usePageTitle } from '../lib/usePageTitle';
import { NotFoundPage } from './NotFoundPage';
import { useStorefront } from '../store/StorefrontContext';

export function ProductPage() {
  const {
    allProductReviews,
    selectedVariants,
    setSelectedVariants,
    selectedNibs,
    activeImageByProduct,
    setActiveImageByProduct,
    setZoomModal,
    catalogProducts,
    firebaseUser,
    memberProfile,
    isSigningIn,
    handleSelectVariant,
    handleSelectNib,
    handleAddToCart,
    isItemWishlisted,
    handleToggleWishlist,
    handleGoogleSignIn,
    handleSubmitProductReview,
    handleDeleteProductReview,
    handleQuickMemberSignInForReviews,
  } = useStorefront();
  const { productId } = useParams();
  const product = catalogProducts.find((p) => p.id === productId);
  usePageTitle(product ? product.name : 'Page not found');

  if (!product) {
    return <NotFoundPage message="We couldn't find that product. It may have been removed from the catalogue." />;
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 lg:py-12">
      <Link
        to="/#collection"
        className="inline-flex items-center gap-1.5 mb-5 text-xs font-semibold text-[#0A2246] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to collection</span>
      </Link>
      <div className="bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
        {/* Left Gallery */}
        <div className="md:col-span-6 bg-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E6E1D8]">
          <div className="p-4 flex-1 flex flex-col items-center justify-center bg-white relative">
            <button
              type="button"
              onClick={() => {
                const modalSrc =
                  activeImageByProduct[product.id] ||
                  product.variants.find(
                    (v) => v.id === selectedVariants[product.id]
                  )?.image ||
                  product.image;
                const matchedInk =
                  product.id === 'pilot-iroshizuku-ink'
                    ? INK_STUDIO_SHADES.find(
                        (s) => s.id === selectedVariants[product.id]
                      )
                    : undefined;
                setZoomModal({
                  src: modalSrc,
                  secondarySrc: matchedInk?.swatchImage,
                  activeView: 'primary',
                  title: product.name,
                  subtitle: product.japaneseTitle,
                  swatchHex: matchedInk?.hex,
                  inkShadeId: matchedInk?.id,
                  zoomLevel: 2,
                  panX: 50,
                  panY: 50,
                });
              }}
              className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-[#FAF8F5]/95 text-[#171614] hover:bg-[#163A5F] hover:text-white rounded border border-[#DCD5C7] shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Zoom 3×</span>
            </button>
            <ResilientImage
              src={
                activeImageByProduct[product.id] ||
                product.variants.find(
                  (v) => v.id === selectedVariants[product.id]
                )?.image ||
                product.image
              }
              alt={product.name}
              fallbackTitle={product.name}
              className={`w-full max-h-[340px] ${
                product.imageFit === 'contain' ||
                product.id === 'pilot-kakuno-madoromi'
                  ? 'object-contain'
                  : 'object-cover rounded'
              }`}
            />
            {product.galleryImages &&
              product.galleryImages.length > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 pt-3 border-t border-[#EAE5DC] w-full max-h-[116px] overflow-y-auto">
                  {product.galleryImages.map((imgItem) => {
                    const currentModalImg =
                      activeImageByProduct[product.id] ||
                      product.image;
                    const isSelectedImg = currentModalImg === imgItem.src;
                    return (
                      <button
                        key={imgItem.src}
                        type="button"
                        onClick={() => {
                          setActiveImageByProduct((prev) => ({
                            ...prev,
                            [product.id]: imgItem.src,
                          }));
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
                        className={`w-10 h-10 rounded overflow-hidden border p-0.5 bg-white cursor-pointer transition-all shrink-0 ${
                          isSelectedImg
                            ? 'border-[#163A5F] ring-1 ring-[#163A5F]'
                            : 'border-[#DCD5C7] opacity-70 hover:opacity-100'
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
                      </button>
                    );
                  })}
                </div>
              )}
          </div>
          <div className="p-5 bg-[#F3EFE8] border-t border-[#E6E1D8]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5C5852] mb-2">
              In the Presentation Box
            </p>
            <ul className="space-y-1 text-xs text-[#3F3D39]">
              {product.includedItems.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#163A5F] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Contiguous Purchase Module */}
        <div className="md:col-span-6 p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#6E6A63] mb-2">
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span>{product.Origin}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#163A5F] font-medium">
                {product.availability}
              </span>
            </div>

            <h2
              id="pdp-modal-title"
              className="font-serif-display text-2xl lg:text-3xl font-semibold text-[#171614]"
            >
              {product.name}
            </h2>
            <p className="text-xs text-[#6E6A63] mt-0.5">
              {product.japaneseTitle}
            </p>

            <p className="font-mono-tabular text-xl font-semibold text-[#171614] mt-3">
              {formatKes(product.priceKes)}
            </p>

            <p className="text-sm text-[#4A4742] leading-relaxed mt-4">
              {product.description}
            </p>

            {/* Variant Selector inside PDP */}
            <div className="mt-5 pt-4 border-t border-[#E6E1D8]">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#5C5852] mb-2">
                {product.variantLabel}
              </span>
              <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                {product.variants.map((variant) => {
                  const selectedId =
                    selectedVariants[product.id] ||
                    product.variants[0].id;
                  const isSelected = variant.id === selectedId;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() =>
                        handleSelectVariant(product.id, variant.id)
                      }
                      className={`w-full p-2.5 text-left rounded border flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[#163A5F] bg-[#163A5F]/8 text-[#171614]'
                          : 'border-[#E6E1D8] bg-white text-[#5C5852] hover:border-[#BDB6AA]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {variant.swatchHex && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: variant.swatchHex }}
                          />
                        )}
                        <div className="truncate">
                          <div className="text-xs font-semibold text-[#171614] truncate">
                            {variant.label}
                          </div>
                          <div className="text-[11px] text-[#6E6A63] truncate">
                            {variant.sublabel}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#163A5F] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nib Selector inside PDP */}
            {product.hasNibSelector && (
              <div className="mt-4 pt-4 border-t border-[#E6E1D8] flex items-center justify-between gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5C5852]">
                  Select Nib Size
                </span>
                <div className="inline-flex items-center gap-2">
                  {(['Fine', 'Medium'] as const).map((nib) => {
                    const modalNib = selectedNibs[product.id] || 'Fine';
                    const selected = modalNib === nib;
                    return (
                      <button
                        key={nib}
                        type="button"
                        onClick={() => handleSelectNib(product.id, nib)}
                        className={`px-3.5 py-1.5 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          selected
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

            {/* Technical Specifications Table */}
            <div className="mt-5 pt-4 border-t border-[#E6E1D8] space-y-1.5">
              {product.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-baseline justify-between gap-4 text-xs"
                >
                  <span className="text-[#6E6A63]">{spec.label}</span>
                  <span className="font-medium text-[#171614] text-right">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E6E1D8] flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const chosenVariant =
                  product.variants.find(
                    (v) => v.id === selectedVariants[product.id]
                  ) || product.variants[0];
                const chosenNib = product.hasNibSelector
                  ? selectedNibs[product.id] || 'Fine'
                  : undefined;
                handleAddToCart(product, chosenVariant, chosenNib, true);
              }}
              className="flex-1 py-3 px-5 text-xs font-semibold tracking-wider uppercase bg-[#0A2246] hover:bg-[#133468] text-white rounded transition-colors cursor-pointer whitespace-nowrap"
            >
              Add to Bag
              {product.hasNibSelector
                ? ` (${selectedNibs[product.id] || 'Fine'} Nib)`
                : ''}{' '}
              · {formatKes(product.priceKes)}
            </button>

            {(() => {
              const modalVariantId =
                selectedVariants[product.id] ||
                product.variants[0].id;
              const modalVariant =
                product.variants.find((v) => v.id === modalVariantId) ||
                product.variants[0];
              const modalWishlisted = isItemWishlisted(
                product.id,
                modalVariant.id
              );
              return (
                <button
                  type="button"
                  onClick={() =>
                    handleToggleWishlist(
                      product,
                      modalVariant,
                      product.hasNibSelector
                        ? selectedNibs[product.id] || 'Fine'
                        : undefined
                    )
                  }
                  aria-pressed={modalWishlisted}
                  className={`inline-flex items-center justify-center gap-1.5 py-3 px-4 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    modalWishlisted
                      ? 'border-[#C88A2E] bg-[#C88A2E]/12 text-[#0A2246]'
                      : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246]'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      modalWishlisted ? 'fill-[#C88A2E] text-[#C88A2E]' : ''
                    }`}
                  />
                  <span>{modalWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                </button>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Customer Reviews & Star Rating Section inside Product Detail Modal */}
      <div className="p-6 lg:p-8 border-t border-[#E6E1D8] bg-white">
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
        />
      </div>
      </div>
    </div>
  );
}
