import { Bell, Check, Eye, Heart, Plus, ShoppingBag, ZoomIn } from 'lucide-react';
import { ResilientImage, VariantStockIndicator } from '../primitives';
import { NibOption } from '../../data/products';
import { useStorefront } from '../../store/StorefrontContext';

export function MadoromiSeries() {
  const {
    selectedNibs,
    setZoomModal,
    justAddedKey,
    openProduct,
    setQuickBuyProduct,
    kakunoMadoromiProduct,
    pilotCon40Product,
    handleSelectVariant,
    handleSelectNib,
    handleAddToCart,
    isItemWishlisted,
    handleToggleWishlist,
    handleOpenNotifyMeModal,
  } = useStorefront();
  return (
    <>
      {/* PILOT KAKUNO MADOROMI SERIES — INDIVIDUAL ONE-BY-ONE PEN SHOWCASE */}
      <div
        id="kakuno-madoromi-showcase"
        className="mt-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#6E6A63] mb-2">
              万年筆 カクノ まどろみカラー · Limited Slumber Lineup (KES 3,200)
            </p>
            <h3
              className="font-serif-display text-2xl lg:text-4xl font-semibold text-[#171614] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Pilot Kakuno Madoromi Series — Every Pen One by One
            </h3>
            <p className="text-sm text-[#4A4742] mt-2 max-w-2xl">
              Inspired by serene twilight slumber moments, each Limited Edition Madoromi
              Kakuno pairs a dreamy translucent pastel barrel with an exclusive{' '}
              <strong>Gold-Tone Smiley Stainless Steel Nib</strong>. Select{' '}
              <strong>Fine (0.35mm)</strong> or <strong>Medium (0.50mm)</strong> on any
              Madoromi shade below.
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <span className="font-mono-tabular text-xs text-[#163A5F] font-medium">
              Gold-Tone Smiley Nib · Includes 1× Black Cartridge
            </span>
            <button
              type="button"
              onClick={() =>
                handleAddToCart(
                  pilotCon40Product,
                  pilotCon40Product.variants[0],
                  undefined,
                  false,
                  'madoromi-con40-upsell'
                )
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                justAddedKey === 'madoromi-con40-upsell'
                  ? 'border-[#1D5B43] bg-[#1D5B43] text-white'
                  : 'border-[#163A5F] bg-white text-[#163A5F] hover:bg-[#163A5F] hover:text-white'
              }`}
            >
              {justAddedKey === 'madoromi-con40-upsell' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added CON-40 Converter (KES 1,200)</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Pilot CON-40 Twist Converter · KES 1,200</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {kakunoMadoromiProduct.variants.map((variant) => {
            const activeNib: NibOption = selectedNibs[variant.id] || 'Medium';
            const customKey = `madoromi-grid-${variant.id}-${activeNib}`;
            const isAdded = justAddedKey === customKey;
            const isWishlisted = isItemWishlisted(kakunoMadoromiProduct.id, variant.id);

            return (
              <div
                key={variant.id}
                className="bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div>
                  {/* Individual Madoromi Pen Image */}
                  <div
                    onClick={() =>
                      setZoomModal({
                        src: variant.image || kakunoMadoromiProduct.image,
                        activeView: 'primary',
                        title: `Pilot Kakuno Madoromi — ${variant.label} (${activeNib} Nib)`,
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
                      src={variant.image || kakunoMadoromiProduct.image}
                      alt={`Pilot Kakuno Madoromi Series — ${variant.label} (${activeNib} Nib)`}
                      fallbackTitle={`Kakuno ${variant.label}`}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomModal({
                          src: variant.image || kakunoMadoromiProduct.image,
                          activeView: 'primary',
                          title: `Pilot Kakuno Madoromi — ${variant.label} (${activeNib} Nib)`,
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
                        className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full border border-black/20 shadow-xs"
                        style={{ backgroundColor: variant.swatchHex }}
                      />
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#6E6A63]">
                      <span>Kakuno Madoromi LE</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#8A6421] font-medium">
                        {variant.nibEngraving || 'Gold-Tone Smiley Nib'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <VariantStockIndicator stockCount={variant.stockCount} compact />
                    </div>

                    <div className="flex items-baseline justify-between gap-2 mt-1.5">
                      <h4 className="text-base font-semibold text-[#171614]">
                        Pilot Kakuno — {variant.label}
                      </h4>
                      <span className="font-mono-tabular text-sm font-semibold text-[#171614] whitespace-nowrap shrink-0">
                        KES 3,200
                      </span>
                    </div>

                    <p className="text-xs text-[#5C5852] mt-2 leading-relaxed">
                      {variant.sublabel}
                    </p>

                    {/* Individual Fine / Medium Nib Selector */}
                    <div className="mt-4 pt-3.5 border-t border-[#EAE5DC] flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-[#5C5852]">Nib Size:</span>
                      <div className="inline-flex items-center gap-1.5">
                        {(['Fine', 'Medium'] as const).map((nib) => {
                          const selected = activeNib === nib;
                          return (
                            <button
                              key={nib}
                              type="button"
                              onClick={() => handleSelectNib(variant.id, nib)}
                              className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                selected
                                  ? 'border-[#163A5F] bg-[#163A5F] text-white font-semibold'
                                  : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#171614]'
                              }`}
                            >
                              {nib} ({nib === 'Fine' ? '0.35mm' : '0.50mm'})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {(typeof variant.stockCount === 'number'
                      ? variant.stockCount
                      : 10) === 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenNotifyMeModal(
                            kakunoMadoromiProduct,
                            variant,
                            activeNib
                          )
                        }
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold tracking-wider uppercase rounded bg-amber-700 hover:bg-amber-800 text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Notify Me ({activeNib})</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectVariant('pilot-kakuno-madoromi', variant.id);
                          handleSelectNib('pilot-kakuno-madoromi', activeNib);
                          handleAddToCart(
                            kakunoMadoromiProduct,
                            variant,
                            activeNib,
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
                            <span>Added ({activeNib})</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Bag ({activeNib})</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        handleSelectVariant('pilot-kakuno-madoromi', variant.id);
                        handleSelectNib('pilot-kakuno-madoromi', activeNib);
                        setQuickBuyProduct(kakunoMadoromiProduct);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold uppercase tracking-wider rounded border border-[#0A2246] bg-white text-[#0A2246] hover:bg-[#0A2246] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#C88A2E]" />
                      <span>Quick Buy</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleToggleWishlist(kakunoMadoromiProduct, variant, activeNib)
                    }
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

          {/* 6th Card: Full 5-Pen Madoromi Slumber Lineup Comparison Card */}
          <div className="bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden flex flex-col justify-between">
            <div>
              <div className="relative aspect-square w-full bg-white p-4 border-b border-[#E6E1D8] flex flex-col items-center justify-center gap-2">
                <ResilientImage
                  src="/assets/madoromi/madoromi_nib_detail.jpg"
                  alt="Pilot Kakuno Madoromi Series — All 5 Translucent Pastel Shades Side by Side"
                  fallbackTitle="Madoromi 5-Pen Lineup"
                  className="w-full h-1/2 object-contain"
                />
                <ResilientImage
                  src="/assets/madoromi/madoromi_series.jpg"
                  alt="Pilot Kakuno Madoromi Slumber Series Full Collection"
                  fallbackTitle="Madoromi Slumber Collection"
                  className="w-full h-1/2 object-cover rounded"
                />
              </div>

              <div className="p-5">
                <div className="flex items-center gap-1.5 text-xs text-[#6E6A63]">
                  <span>Complete 5-Color Overview</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#8A6421] font-medium">Fine &amp; Medium Nibs</span>
                </div>

                <h4 className="text-base font-semibold text-[#171614] mt-1.5">
                  All 5 Madoromi Shades Side-by-Side
                </h4>

                <p className="text-xs text-[#5C5852] mt-2 leading-relaxed">
                  Compare Ivory, Blue, Pink, Brown, and Light Blue together. Every shade is
                  fitted with the signature gold-colored smiley nib in Fine (0.35mm) or Medium
                  (0.50mm).
                </p>

                <div className="mt-4 pt-3.5 border-t border-[#EAE5DC] flex items-center justify-between">
                  <span className="text-xs font-medium text-[#5C5852]">5 Shades:</span>
                  <div className="flex items-center gap-1.5">
                    {kakunoMadoromiProduct.variants.map((v) => (
                      <span
                        key={v.id}
                        title={v.label}
                        className="w-4 h-4 rounded-full border border-black/20"
                        style={{ backgroundColor: v.swatchHex }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 pt-1 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => openProduct(kakunoMadoromiProduct)}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold tracking-wider uppercase rounded border border-[#0A2246] text-[#0A2246] hover:bg-[#0A2246] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Eye className="w-4 h-4" />
                <span>Inspect Madoromi Gallery &amp; Specs</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleToggleWishlist(
                    kakunoMadoromiProduct,
                    kakunoMadoromiProduct.variants[0],
                    'Medium'
                  )
                }
                aria-pressed={isItemWishlisted(
                  kakunoMadoromiProduct.id,
                  kakunoMadoromiProduct.variants[0].id
                )}
                className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                  isItemWishlisted(
                    kakunoMadoromiProduct.id,
                    kakunoMadoromiProduct.variants[0].id
                  )
                    ? 'border-[#C88A2E] bg-[#C88A2E]/12 text-[#0A2246]'
                    : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246]'
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    isItemWishlisted(
                      kakunoMadoromiProduct.id,
                      kakunoMadoromiProduct.variants[0].id
                    )
                      ? 'fill-[#C88A2E] text-[#C88A2E]'
                      : ''
                  }`}
                />
                <span>
                  {isItemWishlisted(
                    kakunoMadoromiProduct.id,
                    kakunoMadoromiProduct.variants[0].id
                  )
                    ? 'In Wishlist'
                    : 'Add to Wishlist'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
