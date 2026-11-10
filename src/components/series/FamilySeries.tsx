import { Bell, Check, Heart, Plus, ShoppingBag, ZoomIn } from 'lucide-react';
import { ResilientImage, VariantStockIndicator } from '../primitives';
import { NibOption } from '../../data/products';
import { useStorefront } from '../../store/StorefrontContext';

export function FamilySeries() {
  const {
    selectedNibs,
    setZoomModal,
    justAddedKey,
    setQuickBuyProduct,
    kakunoFamilyProduct,
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
      {/* PILOT KAKUNO FAMILY SERIES — INDIVIDUAL ONE-BY-ONE PEN SHOWCASE */}
      <div
        id="kakuno-family-showcase"
        className="mt-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#6E6A63] mb-2">
              万年筆 カクノ ファミリーシリーズ · Individual Demonstrator Lineup (KES 2,500)
            </p>
            <h3
              className="font-serif-display text-2xl lg:text-4xl font-semibold text-[#171614] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Pilot Kakuno Family Series — Every Pen One by One
            </h3>
            <p className="text-sm text-[#4A4742] mt-2 max-w-2xl">
              Each member of the Pilot Kakuno Family Series features a crystal-clear
              translucent hexagonal body and its own laser-etched character expression on the
              stainless steel nib. Select <strong>Fine (0.35mm)</strong> or{' '}
              <strong>Medium (0.50mm)</strong> on any pen below.
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <span className="font-mono-tabular text-xs text-[#163A5F] font-medium">
              Includes 1× Black Ink Cartridge · CON-40 Converter Compatible
            </span>
            <button
              type="button"
              onClick={() =>
                handleAddToCart(
                  pilotCon40Product,
                  pilotCon40Product.variants[0],
                  undefined,
                  false,
                  'family-con40-upsell'
                )
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                justAddedKey === 'family-con40-upsell'
                  ? 'border-[#1D5B43] bg-[#1D5B43] text-white'
                  : 'border-[#163A5F] bg-white text-[#163A5F] hover:bg-[#163A5F] hover:text-white'
              }`}
            >
              {justAddedKey === 'family-con40-upsell' ? (
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
          {kakunoFamilyProduct.variants.map((variant) => {
            const activeNib: NibOption = selectedNibs[variant.id] || 'Fine';
            const customKey = `family-grid-${variant.id}-${activeNib}`;
            const isAdded = justAddedKey === customKey;
            const isWishlisted = isItemWishlisted(kakunoFamilyProduct.id, variant.id);

            return (
              <div
                key={variant.id}
                className="bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div>
                  {/* Individual Goldspot Pen Image */}
                  <div
                    onClick={() =>
                      setZoomModal({
                        src: variant.image || kakunoFamilyProduct.image,
                        activeView: 'primary',
                        title: `Pilot Kakuno Family Series — ${variant.label} (${activeNib} Nib)`,
                        subtitle: `${variant.nibEngraving} · ${variant.sublabel}`,
                        swatchHex: variant.swatchHex,
                        zoomLevel: 2,
                        panX: 50,
                        panY: 50,
                      })
                    }
                    className="relative aspect-square w-full bg-white p-6 border-b border-[#E6E1D8] flex items-center justify-center cursor-zoom-in group"
                  >
                    <ResilientImage
                      src={variant.image || kakunoFamilyProduct.image}
                      alt={`Pilot Kakuno Family Series — ${variant.label} (${activeNib} Nib)`}
                      fallbackTitle={`Kakuno ${variant.label}`}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomModal({
                          src: variant.image || kakunoFamilyProduct.image,
                          activeView: 'primary',
                          title: `Pilot Kakuno Family Series — ${variant.label} (${activeNib} Nib)`,
                          subtitle: `${variant.nibEngraving} · ${variant.sublabel}`,
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
                      <span>Kakuno Family Series</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#163A5F] font-medium">
                        {variant.nibEngraving}
                      </span>
                      <span aria-hidden="true">·</span>
                      <VariantStockIndicator stockCount={variant.stockCount} compact />
                    </div>

                    <div className="flex items-baseline justify-between gap-2 mt-1.5">
                      <h4 className="text-base font-semibold text-[#171614]">
                        Pilot Kakuno — {variant.label}
                      </h4>
                      <span className="font-mono-tabular text-sm font-semibold text-[#171614] whitespace-nowrap shrink-0">
                        KES 2,500
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
                            kakunoFamilyProduct,
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
                          handleSelectVariant('pilot-kakuno-family', variant.id);
                          handleSelectNib('pilot-kakuno-family', activeNib);
                          handleAddToCart(
                            kakunoFamilyProduct,
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
                        handleSelectVariant('pilot-kakuno-family', variant.id);
                        handleSelectNib('pilot-kakuno-family', activeNib);
                        setQuickBuyProduct(kakunoFamilyProduct);
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
                      handleToggleWishlist(kakunoFamilyProduct, variant, activeNib)
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
        </div>
      </div>
    </>
  );
}
