import { Bell, Check, Heart, Plus, ShoppingBag, ZoomIn } from 'lucide-react';
import { ResilientImage, VariantStockIndicator } from '../primitives';
import { FEATURED_PRODUCTS } from '../../data/products';
import { ChromaticInkRibbonIsland } from '../../islands/ChromaticInkRibbonIsland';
import { InkMixingSetBuilderIsland } from '../../islands/InkMixingSetBuilderIsland';
import { INK_COLOR_FAMILIES } from '../../lib/storefront';
import { resolveAssetUrl } from '../../utils/assetResolver';
import { useStorefront } from '../../store/StorefrontContext';

export function IroshizukuSeries() {
  const {
    activeInkFamily,
    setActiveInkFamily,
    inkCardViewMode,
    setInkCardViewMode,
    hoveredInkZoom,
    setHoveredInkZoom,
    setZoomModal,
    justAddedKey,
    setQuickBuyProduct,
    iroshizukuProduct,
    filteredInkVariety,
    handleSelectVariant,
    handleAddInkShadeDirectly,
    isItemWishlisted,
    handleToggleInkShadeWishlist,
    handleAddBundleToCart,
    handleOpenNotifyMeModal,
  } = useStorefront();
  return (
    <>
      {/* FULL 24-SHADE PILOT IROSHIZUKU BOTTLE & SWATCH VARIETY SHOWCASE */}
      <div
        id="iroshizuku-gallery"
        className="mt-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#6E6A63] mb-2">
              色彩雫 · Complete 24-Shade Bottled Ink Library with Handwritten Swatches (50ml · KES 6,000)
            </p>
            <h3
              className="font-serif-display text-2xl lg:text-4xl font-semibold text-[#171614] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Pilot Iroshizuku — Full 24-Color Swatch &amp; Bottle Variety
            </h3>
            <p className="text-sm text-[#4A4742] mt-2 max-w-2xl">
              Each 50ml glass bottle is shown alongside its genuine handwritten Pilot
              Iroshizuku ink swatch card so you can see the true wet color, shading, and
              splatter detail. Explore the <strong>24-Color Chromatic Spectrum Ribbon</strong>{' '}
              below, <strong>hover over any bottle to magnify (2.2×)</strong>, or click{' '}
              <strong>Zoom</strong> for fullscreen 3× inspection.
            </p>
          </div>

          {/* Color Family Segmented Filter */}
          <div
            role="tablist"
            aria-label="Filter Iroshizuku inks by color family"
            className="flex flex-wrap items-center gap-1 p-1 bg-[#E6E1D8] rounded-md self-start lg:self-auto"
          >
            {INK_COLOR_FAMILIES.map((family) => {
              const active = activeInkFamily === family;
              return (
                <button
                  key={family}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveInkFamily(family)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#FAF8F5] text-[#171614] shadow-xs'
                      : 'text-[#5C5852] hover:text-[#171614]'
                  }`}
                >
                  {family}
                </button>
              );
            })}
          </div>
        </div>

        {/* ASTRO ISLAND: Interactive 24-Color Chromatic Swatch Ribbon & Dual Spotlight Stage */}
        <ChromaticInkRibbonIsland
          justAddedKey={justAddedKey}
          onAddInkShade={handleAddInkShadeDirectly}
          isShadeWishlisted={(shadeId) =>
            isItemWishlisted('pilot-iroshizuku-ink', shadeId)
          }
          onToggleShadeWishlist={handleToggleInkShadeWishlist}
          onOpenZoomModal={(payload) =>
            setZoomModal({
              ...payload,
              zoomLevel: 2,
              panX: 50,
              panY: 45,
            })
          }
        />

        {/* 4-Column Bottle + Swatch Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredInkVariety.map((shade) => {
            const feedbackKey = `pilot-iroshizuku-ink-${shade.id}`;
            const isAdded = justAddedKey === feedbackKey;
            const viewMode = inkCardViewMode[shade.id] || 'bottle';
            const activeCardImg =
              viewMode === 'swatch' ? shade.swatchImage : shade.image;
            const isHoverZooming = hoveredInkZoom?.id === shade.id;
            const isWishlisted = isItemWishlisted('pilot-iroshizuku-ink', shade.id);

            return (
              <div
                key={shade.id}
                className="bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div>
                  {/* Goldspot 50ml Bottle + Handwritten Swatch Image with Hover Loupe & Zoom Trigger */}
                  <div
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      setHoveredInkZoom({
                        id: shade.id,
                        x: Math.max(0, Math.min(100, x)),
                        y: Math.max(0, Math.min(100, y)),
                      });
                    }}
                    onMouseLeave={() => setHoveredInkZoom(null)}
                    onClick={() =>
                      setZoomModal({
                        src: shade.image,
                        secondarySrc: shade.swatchImage,
                        activeView: viewMode === 'swatch' ? 'secondary' : 'primary',
                        title: `Pilot Iroshizuku — ${shade.name} (${shade.kanji})`,
                        subtitle: `${shade.meaning} · ${shade.sheenNote}`,
                        swatchHex: shade.hex,
                        inkShadeId: shade.id,
                        zoomLevel: 2,
                        panX: 50,
                        panY: 45,
                      })
                    }
                    className="relative aspect-square w-full bg-white p-4 border-b border-[#E6E1D8] flex items-center justify-center overflow-hidden cursor-zoom-in group"
                  >
                    <ResilientImage
                      src={activeCardImg}
                      alt={`Pilot Iroshizuku 50ml Ink — ${shade.name} (${shade.kanji}) ${shade.meaning}`}
                      fallbackTitle={`Iroshizuku ${shade.name}`}
                      className="w-full h-full object-contain transition-transform duration-150"
                    />

                    {/* Interactive 2.25x Hover Magnifier Overlay */}
                    {isHoverZooming && hoveredInkZoom && (
                      <div
                        className="pointer-events-none absolute inset-0 bg-white z-10 hidden sm:block"
                        style={{
                          backgroundImage: `url(${resolveAssetUrl(activeCardImg, 'full')})`,
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '225%',
                          backgroundPosition: `${hoveredInkZoom.x}% ${hoveredInkZoom.y}%`,
                        }}
                      />
                    )}

                    {/* Top-Left Zoom Lightbox Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomModal({
                          src: shade.image,
                          secondarySrc: shade.swatchImage,
                          activeView: viewMode === 'swatch' ? 'secondary' : 'primary',
                          title: `Pilot Iroshizuku — ${shade.name} (${shade.kanji})`,
                          subtitle: `${shade.meaning} · ${shade.sheenNote}`,
                          swatchHex: shade.hex,
                          inkShadeId: shade.id,
                          zoomLevel: 2,
                          panX: 50,
                          panY: 45,
                        });
                      }}
                      title={`Zoom & Inspect ${shade.name} Ink Swatch`}
                      className="absolute top-2.5 left-2.5 z-20 inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-[#FAF8F5]/95 text-[#171614] hover:bg-[#163A5F] hover:text-white rounded border border-[#DCD5C7] shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <ZoomIn className="w-3 h-3" />
                      <span>Zoom</span>
                    </button>

                    {/* Color Swatch Disc */}
                    <span
                      title={`Ink Swatch: ${shade.name}`}
                      className="absolute top-2.5 right-2.5 z-20 w-6 h-6 rounded-full border border-black/20 shadow-xs"
                      style={{ backgroundColor: shade.hex }}
                    />

                    {/* Bottom Segmented Switcher: Bottle + Swatch vs Swatch Close-Up */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-2.5 inset-x-2.5 z-20 flex items-center justify-center gap-1 bg-[#FAF8F5]/95 p-1 rounded border border-[#E6E1D8] shadow-xs"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setInkCardViewMode((prev) => ({
                            ...prev,
                            [shade.id]: 'bottle',
                          }))
                        }
                        className={`flex-1 py-1 px-2 text-[11px] font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                          viewMode === 'bottle'
                            ? 'bg-[#163A5F] text-white'
                            : 'text-[#5C5852] hover:text-[#171614]'
                        }`}
                      >
                        Bottle + Swatch
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setInkCardViewMode((prev) => ({
                            ...prev,
                            [shade.id]: 'swatch',
                          }))
                        }
                        className={`flex-1 py-1 px-2 text-[11px] font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                          viewMode === 'swatch'
                            ? 'bg-[#163A5F] text-white'
                            : 'text-[#5C5852] hover:text-[#171614]'
                        }`}
                      >
                        Swatch Close-Up
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#6E6A63]">
                      <span>{shade.colorFamily}</span>
                      <span aria-hidden="true">·</span>
                      <span>50ml</span>
                      <span aria-hidden="true">·</span>
                      <VariantStockIndicator
                        stockCount={
                          iroshizukuProduct.variants.find((v) => v.id === shade.id)
                            ?.stockCount
                        }
                        compact
                      />
                    </div>

                    <div className="flex items-baseline justify-between gap-2 mt-1">
                      <h4 className="text-base font-semibold text-[#171614]">
                        {shade.name}{' '}
                        <span className="font-normal text-xs text-[#6E6A63]">
                          ({shade.kanji})
                        </span>
                      </h4>
                      <span className="font-mono-tabular text-xs font-semibold text-[#171614] whitespace-nowrap shrink-0">
                        KES 6,000
                      </span>
                    </div>

                    <p className="text-xs font-medium text-[#163A5F] mt-0.5">
                      {shade.meaning}
                    </p>
                    <p className="text-xs text-[#5C5852] mt-2 leading-relaxed line-clamp-2">
                      {shade.sheenNote}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const matchedVar =
                        iroshizukuProduct.variants.find((v) => v.id === shade.id) ||
                        iroshizukuProduct.variants[0];
                      const shadeStock =
                        typeof matchedVar?.stockCount === 'number'
                          ? matchedVar.stockCount
                          : 10;
                      if (shadeStock === 0) {
                        return (
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenNotifyMeModal(iroshizukuProduct, matchedVar)
                            }
                            className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2.5 text-xs font-semibold tracking-wider uppercase rounded bg-amber-700 hover:bg-amber-800 text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <Bell className="w-3.5 h-3.5" />
                            <span>Notify Me</span>
                          </button>
                        );
                      }
                      return (
                        <button
                          type="button"
                          onClick={() => handleAddInkShadeDirectly(shade)}
                          className={`flex-1 inline-flex items-center justify-center gap-1 py-2 px-2.5 text-xs font-semibold tracking-wider uppercase rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
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
                      );
                    })()}

                    <button
                      type="button"
                      onClick={() => {
                        const inkProduct = FEATURED_PRODUCTS.find(
                          (p) => p.id === 'pilot-iroshizuku-ink'
                        )!;
                        handleSelectVariant('pilot-iroshizuku-ink', shade.id);
                        setQuickBuyProduct(inkProduct);
                      }}
                      className="inline-flex items-center justify-center gap-1 py-2 px-2.5 text-xs font-semibold uppercase tracking-wider rounded border border-[#0A2246] bg-white text-[#0A2246] hover:bg-[#0A2246] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <ShoppingBag className="w-3 h-3 text-[#C88A2E]" />
                      <span>Quick Buy</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleInkShadeWishlist(shade)}
                      aria-pressed={isWishlisted}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
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
                      <span>{isWishlisted ? 'In Wishlist' : 'Wishlist'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setZoomModal({
                          src: shade.image,
                          secondarySrc: shade.swatchImage,
                          activeView: 'secondary',
                          title: `Pilot Iroshizuku — ${shade.name} (${shade.kanji})`,
                          subtitle: `${shade.meaning} · ${shade.sheenNote}`,
                          swatchHex: shade.hex,
                          inkShadeId: shade.id,
                          zoomLevel: 2,
                          panX: 50,
                          panY: 45,
                        })
                      }
                      className="px-2.5 py-1.5 text-xs font-medium rounded border border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Swatch Card
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ASTRO ISLAND: 3-Bottle 50ml Iroshizuku Ink Mixing Set Builder (KES 20,000 Bundle · 10% Privilege) */}
        <InkMixingSetBuilderIsland
          onAddInkMixingSetToCart={handleAddBundleToCart}
        />
      </div>
    </>
  );
}
