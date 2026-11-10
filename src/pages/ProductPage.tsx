import { Bell, Heart, ZoomIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ResilientImage } from '../components/primitives';
import { INK_STUDIO_SHADES, NibOption, Product, ProductVariant } from '../data/products';
import { CustomerReviewsIsland } from '../islands/CustomerReviewsIsland';
import { displayKind, displayName, stockLabel, stockState } from '../lib/productDisplay';
import { ROUTES } from '../lib/routes';
import { formatKes } from '../lib/storefront';
import { usePageTitle } from '../lib/usePageTitle';
import { useStorefront } from '../store/StorefrontContext';
import { resolveAssetUrl } from '../utils/assetResolver';
import { NotFoundPage } from './NotFoundPage';

/** The number that ships in the default settings; no real shop answers it. */
const PLACEHOLDER_WHATSAPP = '254700000000';
/** Above this many options, colours are shown as a compact swatch grid. */
const SWATCH_GRID_THRESHOLD = 8;
const NIB_WIDTH: Record<NibOption, string> = { Fine: '0.35 mm', Medium: '0.50 mm' };

export function ProductPage() {
  const { productId } = useParams();
  const { catalogProducts } = useStorefront();
  const product = catalogProducts.find((p) => p.id === productId);
  usePageTitle(product ? displayName(product) : 'Page not found');

  if (!product) {
    return (
      <NotFoundPage message="We couldn't find that product. It may have been removed from the catalogue." />
    );
  }
  // Keyed so local gallery state resets when moving between products.
  return <ProductDetail key={product.id} product={product} />;
}

function ProductDetail({ product }: { product: Product }) {
  const {
    allProductReviews,
    selectedVariants,
    selectedNibs,
    storeSettings,
    firebaseUser,
    memberProfile,
    isSigningIn,
    setZoomModal,
    handleSelectVariant,
    handleSelectNib,
    handleAddToCart,
    handleOpenNotifyMeModal,
    isItemWishlisted,
    handleToggleWishlist,
    handleGoogleSignIn,
    handleSubmitProductReview,
    handleDeleteProductReview,
    handleQuickMemberSignInForReviews,
  } = useStorefront();
  const [searchParams, setSearchParams] = useSearchParams();

  // The chosen colour lives in the URL so a specific colour can be shared.
  const variant: ProductVariant =
    product.variants.find((v) => v.id === searchParams.get('variant')) ??
    product.variants.find((v) => v.id === selectedVariants[product.id]) ??
    product.variants[0];
  const nibs: NibOption[] = product.hasNibSelector
    ? product.availableNibs?.length
      ? product.availableNibs
      : ['Fine', 'Medium']
    : [];
  const nib: NibOption | undefined = product.hasNibSelector
    ? selectedNibs[product.id] || nibs[0]
    : undefined;

  const selectVariant = (variantId: string) => {
    handleSelectVariant(product.id, variantId);
    setSearchParams({ variant: variantId }, { replace: true, preventScrollReset: true });
  };

  // Photos for the chosen colour: an ink shade shows its bottle and swatch card,
  // other products show their gallery with the colour's own photo first.
  const inkShade = INK_STUDIO_SHADES.find((s) => s.id === variant.id);
  const photos: { src: string; caption: string }[] = inkShade
    ? [
        { src: inkShade.image, caption: `${inkShade.name} bottle` },
        { src: inkShade.swatchImage, caption: `${inkShade.name} handwritten swatch` },
      ]
    : [
        ...(variant.image ? [{ src: variant.image, caption: variant.label }] : []),
        ...(product.galleryImages ?? []).filter((g) => g.src !== variant.image),
      ];
  if (photos.length === 0) photos.push({ src: product.image, caption: product.name });

  const [photoSrc, setPhotoSrc] = useState(photos[0].src);
  useEffect(() => {
    setPhotoSrc(photos[0].src);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant.id]);
  const activePhoto = photos.find((p) => p.src === photoSrc) ?? photos[0];

  const name = displayName(product);
  const stock = stockState(variant);
  const wishlisted = isItemWishlisted(product.id, variant.id);
  const reviewCount = allProductReviews.filter((r) => r.productId === product.id).length;
  const useSwatchGrid = product.variants.length > SWATCH_GRID_THRESHOLD;

  const whatsappPhone = (storeSettings.whatsappConciergePhone || '').replace(/\D/g, '');
  const whatsappUrl =
    whatsappPhone && whatsappPhone !== PLACEHOLDER_WHATSAPP
      ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
          `Hello PENS R US, I'd like to order: ${name}, ${variant.label}${
            nib ? `, ${nib} nib` : ''
          } (${formatKes(product.priceKes)}).`
        )}`
      : null;

  const openZoom = () =>
    setZoomModal({
      src: activePhoto.src,
      secondarySrc: inkShade?.swatchImage,
      activeView: 'primary',
      title: product.name,
      subtitle: product.japaneseTitle,
      swatchHex: inkShade?.hex,
      inkShadeId: inkShade?.id,
      zoomLevel: 2,
      panX: 50,
      panY: 50,
    });

  return (
    <div className="page pb-14">
      <nav aria-label="Breadcrumb" className="py-5 text-sm text-ink-soft">
        <Link to={ROUTES.home} className="hover:underline">
          Home
        </Link>{' '}
        /{' '}
        <Link to={ROUTES.range} className="hover:underline">
          Shop
        </Link>{' '}
        / <span className="text-ink">{name}</span>
      </nav>

      <div className="grid items-start gap-6 md:grid-cols-[1.1fr_1fr] md:gap-12">
        {/* Gallery */}
        <div className="min-w-0 md:sticky md:top-28">
          <div className="relative aspect-square overflow-hidden rounded-md border border-line bg-sheet">
            <ResilientImage
              key={activePhoto.src}
              src={activePhoto.src}
              alt={`${name}, ${activePhoto.caption}`}
              fallbackTitle={name}
              priority
              className={`h-full w-full ${
                product.imageFit === 'contain' ? 'object-contain' : 'object-cover'
              }`}
            />
            <button
              type="button"
              onClick={openZoom}
              className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-line bg-sheet/90 px-2.5 py-1.5 text-sm font-medium hover:border-ink"
            >
              <ZoomIn className="h-4 w-4" />
              Zoom
            </button>
          </div>
          {photos.length > 1 && (
            <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
              {photos.map((photo, index) => (
                <button
                  key={photo.src}
                  type="button"
                  aria-label={`Photo ${index + 1}: ${photo.caption}`}
                  aria-pressed={photo.src === activePhoto.src}
                  onClick={() => setPhotoSrc(photo.src)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded border bg-sheet ${
                    photo.src === activePhoto.src ? 'border-2 border-ink' : 'border-line hover:border-faint'
                  }`}
                >
                  <img
                    loading="lazy"
                    decoding="async"
                    src={resolveAssetUrl(photo.src, 'small')}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase panel */}
        <div className="flex min-w-0 flex-col gap-6">
          <div>
            <h1 className="text-3xl leading-tight md:text-[2.5rem]">{name}</h1>
            <p className="mt-1.5 text-ink-soft">
              {displayKind(product)} · {product.Origin}
              {reviewCount > 0 && (
                <>
                  {' · '}
                  <a href="#reviews" className="underline underline-offset-4 hover:no-underline">
                    {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                  </a>
                </>
              )}
            </p>
          </div>

          <p className="font-mono-tabular text-2xl font-semibold">{formatKes(product.priceKes)}</p>

          <p className="text-ink-soft">{product.shortSummary}</p>

          {product.variants.length > 1 && (
            <fieldset className="flex min-w-0 flex-col gap-2.5">
              <legend className="mb-2.5 text-[0.95rem]">
                Colour: <strong className="font-semibold">{variant.label}</strong>
              </legend>
              {useSwatchGrid ? (
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      title={v.label}
                      aria-label={v.label}
                      aria-pressed={v.id === variant.id}
                      onClick={() => selectVariant(v.id)}
                      className={`aspect-[5/3] outline-offset-[3px] ${
                        v.id === variant.id ? 'outline-2 outline-ink' : 'hover:outline-1 hover:outline-faint'
                      } ${stockState(v) === 'out' ? 'opacity-40' : ''}`}
                      style={{
                        backgroundColor: v.swatchHex || 'var(--color-wash)',
                        borderRadius: '4px 12px 5px 10px / 10px 5px 12px 4px',
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      aria-pressed={v.id === variant.id}
                      onClick={() => selectVariant(v.id)}
                      className={`inline-flex items-center gap-2 rounded-md border bg-sheet px-3.5 py-2.5 text-[0.95rem] font-medium ${
                        v.id === variant.id ? 'border-ink ring-1 ring-ink' : 'border-line hover:border-faint'
                      } ${stockState(v) === 'out' ? 'text-faint line-through' : ''}`}
                    >
                      {v.swatchHex && (
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-line"
                          style={{ backgroundColor: v.swatchHex }}
                        />
                      )}
                      {v.label}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-sm text-ink-soft">{variant.sublabel}</p>
            </fieldset>
          )}

          {nibs.length > 0 && (
            <fieldset className="flex flex-col">
              <legend className="mb-2.5 flex w-full justify-between gap-3 text-[0.95rem]">
                <span>Nib</span>
                <span className="text-ink-soft">Fine suits small handwriting</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {nibs.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={option === nib}
                    onClick={() => handleSelectNib(product.id, option)}
                    className={`rounded-md border bg-sheet px-3.5 py-2.5 text-[0.95rem] font-medium ${
                      option === nib ? 'border-ink ring-1 ring-ink' : 'border-line hover:border-faint'
                    }`}
                  >
                    {option} <span className="font-normal text-ink-soft">{NIB_WIDTH[option]}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="flex flex-col gap-2.5">
            <p className={`text-[0.95rem] font-medium ${stock === 'in' ? 'text-ok' : 'text-low'}`}>
              {stockLabel(variant)}
            </p>
            {stock === 'out' ? (
              <button
                type="button"
                className="btn w-full"
                onClick={() => handleOpenNotifyMeModal(product, variant, nib)}
              >
                <Bell className="h-4 w-4" />
                Notify me when it's back
              </button>
            ) : (
              <button
                type="button"
                className="btn w-full"
                onClick={() => handleAddToCart(product, variant, nib, true)}
              >
                Add to bag · {formatKes(product.priceKes)}
              </button>
            )}
            <div className="flex flex-wrap gap-2.5">
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1">
                  Order on WhatsApp
                </a>
              )}
              <button
                type="button"
                aria-pressed={wishlisted}
                onClick={() => handleToggleWishlist(product, variant, nib)}
                className="btn-ghost flex-1"
              >
                <Heart className={`h-4 w-4 ${wishlisted ? 'fill-brand text-brand' : ''}`} />
                {wishlisted ? 'Saved' : 'Save for later'}
              </button>
            </div>
          </div>

          <div className="grid gap-1 border-t border-line pt-4 text-sm text-ink-soft">
            <p>
              {product.priceKes >= storeSettings.freeDeliveryThresholdKes
                ? 'Free delivery.'
                : `Free delivery on orders from ${formatKes(storeSettings.freeDeliveryThresholdKes)}.`}{' '}
              Same day in Nairobi if ordered before 3 pm.
            </p>
            <p>M-Pesa or cash on delivery.</p>
          </div>

          <div className="border-b border-line">
            {product.includedItems.length > 0 && (
              <details open className="border-t border-line py-3.5">
                <summary className="cursor-pointer font-semibold">In the box</summary>
                <ul className="mt-2.5 list-disc space-y-1 pl-5 text-ink-soft">
                  {product.includedItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>
            )}
            {product.specs.length > 0 && (
              <details className="border-t border-line py-3.5">
                <summary className="cursor-pointer font-semibold">Specifications</summary>
                <dl className="mt-2.5 grid gap-2 text-[0.925rem]">
                  {product.specs.map((spec) => (
                    <div key={spec.label} className="grid grid-cols-[40%_1fr] gap-3">
                      <dt className="text-ink-soft">{spec.label}</dt>
                      <dd>{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}
            <details className="border-t border-line py-3.5">
              <summary className="cursor-pointer font-semibold">About this {product.category === 'Bottled Inks' ? 'ink' : 'product'}</summary>
              <p className="mt-2.5 text-ink-soft">{product.description}</p>
            </details>
          </div>
        </div>
      </div>

      <section id="reviews" className="mt-12 scroll-mt-28 border-t border-line pt-10">
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
      </section>
    </div>
  );
}
