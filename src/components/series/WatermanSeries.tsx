import { Check, Heart, Plus, ShoppingBag, ZoomIn } from 'lucide-react';
import { ResilientImage, VariantStockIndicator } from '../primitives';
import { useStorefront } from '../../store/StorefrontContext';

export function WatermanSeries() {
  const {
    setZoomModal,
    justAddedKey,
    setQuickBuyProduct,
    watermanInkProduct,
    handleSelectVariant,
    handleAddToCart,
    isItemWishlisted,
    handleToggleWishlist,
  } = useStorefront();
  return (
    <>
      {/* WATERMAN PARIS 50ML BOTTLED INKS — SERENITY BLUE, INTENSE BLACK & AUDACIOUS RED SHOWCASE */}
      <div
        id="waterman-ink-showcase"
        className="mt-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#6E6A63] mb-2">
              Encre de Paris · Classic 50ml Multi-Faceted Glass Bottles (KES 2,000 per Bottle)
            </p>
            <h3
              className="font-serif-display text-2xl lg:text-4xl font-semibold text-[#171614] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Waterman Paris 50ml Bottled Inks — Serenity Blue, Intense Black &amp; Audacious Red
            </h3>
            <p className="text-sm text-[#4A4742] mt-2 max-w-2xl">
              Engineered with angled side facets so you can tip the bottle on its side for
              effortless converter filling when ink runs low. Safe, smooth-flowing everyday
              inks for all Pilot and Waterman fountain pens at <strong>KES 2,000</strong> per
              50ml bottle.
            </p>
          </div>
          <span className="font-mono-tabular text-xs text-[#163A5F] font-medium">
            50ml Multi-Faceted Glass Flacon · Made in France
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {watermanInkProduct.variants.map((variant) => {
            const customKey = `waterman-grid-${variant.id}`;
            const isAdded = justAddedKey === customKey;
            const shortShadeName = variant.label.split(' · ')[0];
            const frenchTitle = variant.label.split(' · ')[1] || 'Encre de Paris';
            const isWishlisted = isItemWishlisted(watermanInkProduct.id, variant.id);

            return (
              <div
                key={variant.id}
                className="bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div>
                  {/* Cult Pens Waterman 50ml Bottle Photo with Zoom Trigger */}
                  <div
                    onClick={() =>
                      setZoomModal({
                        src: variant.image || watermanInkProduct.image,
                        activeView: 'primary',
                        title: `Waterman Paris 50ml Ink — ${variant.label}`,
                        subtitle: variant.sublabel,
                        swatchHex: variant.swatchHex,
                        zoomLevel: 2,
                        panX: 50,
                        panY: 50,
                      })
                    }
                    className="relative aspect-square w-full bg-white p-6 border-b border-[#E6E1D8] flex items-center justify-center cursor-zoom-in group"
                  >
                    <ResilientImage
                      src={variant.image || watermanInkProduct.image}
                      alt={`Waterman Paris 50ml Bottled Ink — ${variant.label}`}
                      fallbackTitle={`Waterman ${shortShadeName}`}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomModal({
                          src: variant.image || watermanInkProduct.image,
                          activeView: 'primary',
                          title: `Waterman Paris 50ml Ink — ${variant.label}`,
                          subtitle: variant.sublabel,
                          swatchHex: variant.swatchHex,
                          zoomLevel: 2,
                          panX: 50,
                          panY: 50,
                        });
                      }}
                      className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-[#FAF8F5]/95 text-[#171614] hover:bg-[#163A5F] hover:text-white rounded border border-[#DCD5C7] shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <ZoomIn className="w-3 h-3" />
                      <span>Zoom</span>
                    </button>
                    {variant.swatchHex && (
                      <span
                        title={variant.label}
                        className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full border border-black/20 shadow-xs"
                        style={{ backgroundColor: variant.swatchHex }}
                      />
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#6E6A63]">
                      <span>Waterman Paris · 50ml</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#163A5F] font-medium">{frenchTitle}</span>
                      <span aria-hidden="true">·</span>
                      <VariantStockIndicator stockCount={variant.stockCount} compact />
                    </div>

                    <div className="flex items-baseline justify-between gap-2 mt-1.5">
                      <h4 className="text-base font-semibold text-[#171614]">
                        Waterman — {shortShadeName}
                      </h4>
                      <span className="font-mono-tabular text-sm font-semibold text-[#171614] whitespace-nowrap shrink-0">
                        KES 2,000
                      </span>
                    </div>

                    <p className="text-xs text-[#5C5852] mt-2 leading-relaxed">
                      {variant.sublabel}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectVariant('waterman-ink-bottle', variant.id);
                        handleAddToCart(
                          watermanInkProduct,
                          variant,
                          undefined,
                          false,
                          customKey
                        );
                      }}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold tracking-wider uppercase rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        isAdded
                          ? 'bg-[#1D5B43] text-white'
                          : 'bg-[#0A2246] hover:bg-[#133468] text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Bag</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleSelectVariant('waterman-ink-bottle', variant.id);
                        setQuickBuyProduct(watermanInkProduct);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold uppercase tracking-wider rounded border border-[#0A2246] bg-white text-[#0A2246] hover:bg-[#0A2246] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#C88A2E]" />
                      <span>Quick Buy</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleWishlist(watermanInkProduct, variant)}
                    aria-pressed={isWishlisted}
                    className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
