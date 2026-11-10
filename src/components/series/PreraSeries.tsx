import { Check, Heart, Plus, ShoppingBag, ZoomIn } from 'lucide-react';
import { ResilientImage, VariantStockIndicator } from '../primitives';
import { NibOption } from '../../data/products';
import { resolveAssetUrl } from '../../utils/assetResolver';
import { useStorefront } from '../../store/StorefrontContext';

export function PreraSeries() {
  const {
    selectedNibs,
    activePreraHeroImg,
    setActivePreraHeroImg,
    setZoomModal,
    justAddedKey,
    setQuickBuyProduct,
    pilotPreraProduct,
    handleSelectVariant,
    handleSelectNib,
    handleAddToCart,
    isItemWishlisted,
    handleToggleWishlist,
  } = useStorefront();
  return (
    <>
      {/* PILOT PRERA FOUNTAIN PEN IN EMPRESS TEAL — DEDICATED PRODUCT PAGE & SERIES SHOWCASE (KES 8,500) */}
      <div
        id="pilot-prera-showcase"
        className="mt-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#B58435] mb-2">
              万年筆 プレラ · Flagship Product Page · CON-40 Converter Included (KES 8,500)
            </p>
            <h3
              className="font-serif-display text-2xl lg:text-4xl font-semibold text-[#0A2246] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Pilot Prera Fountain Pen in Empress Teal — Complete Product Page
            </h3>
            <p className="text-sm text-[#4A4742] mt-2 max-w-2xl">
              Inspired by the cozy, welcoming atmosphere of a café where the aroma of fresh
              coffee and warm spices fills the air. The deep, vibrant{' '}
              <strong>Empress Teal</strong> translucent resin body offers a window into the
              pen’s inner mechanics and included <strong>Pilot CON-40 converter</strong>,
              paired with Pilot’s signature cushioned snap-cap closure.
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-1.5">
            <span className="font-mono-tabular text-sm font-bold text-[#0A2246]">
              KES 8,500 · Fine (0.35mm) &amp; Medium (0.50mm)
            </span>
            <span className="text-xs text-[#1D5B43] font-medium">
              Includes Both Pilot CON-40 Converter &amp; Black Ink Cartridge
            </span>
          </div>
        </div>

        {/* PART A: DEDICATED EMPRESS TEAL FLAGSHIP PRODUCT PAGE (2-Column Interactive Gallery + Specifications + Purchase Module) */}
        {(() => {
          const empressVariant = pilotPreraProduct.variants[0];
          const empressNib: NibOption = selectedNibs['prera-empress-teal'] || 'Medium';
          const empressFeedbackKey = `prera-flagship-empress-teal-${empressNib}`;
          const isEmpressAdded = justAddedKey === empressFeedbackKey;
          const isEmpressWishlisted = isItemWishlisted(
            pilotPreraProduct.id,
            empressVariant.id
          );
          const empressGallery = pilotPreraProduct.galleryImages!.slice(0, 6);

          return (
            <div className="bg-[#FAF8F5] border border-[#DCD5C7] rounded-lg overflow-hidden shadow-xs mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                {/* Left Column: 6-Angle Empress Teal Studio Gallery */}
                <div className="lg:col-span-6 bg-white border-b lg:border-b-0 lg:border-r border-[#E6E1D8] p-6 lg:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#0A2246]">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: '#125A66' }}
                        />
                        <span>Empress Teal · SKU P22139 / P22073</span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setZoomModal({
                            src: activePreraHeroImg,
                            activeView: 'primary',
                            title: `Pilot Prera Fountain Pen in Empress Teal (${empressNib} Nib)`,
                            subtitle:
                              'Translucent Empress Teal Resin · Silver Trim · Includes CON-40 Converter',
                            swatchHex: '#125A66',
                            zoomLevel: 2,
                            panX: 50,
                            panY: 50,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#FAF8F5] text-[#171614] hover:bg-[#0A2246] hover:text-white rounded border border-[#DCD5C7] transition-colors cursor-pointer"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>Zoom 3×</span>
                      </button>
                    </div>

                    {/* Main Interactive Photo Stage */}
                    <div
                      onClick={() =>
                        setZoomModal({
                          src: activePreraHeroImg,
                          activeView: 'primary',
                          title: `Pilot Prera Fountain Pen in Empress Teal (${empressNib} Nib)`,
                          subtitle:
                            'Translucent Empress Teal Resin · Silver Trim · Includes CON-40 Converter',
                          swatchHex: '#125A66',
                          zoomLevel: 2,
                          panX: 50,
                          panY: 50,
                        })
                      }
                      className="aspect-square max-h-[380px] w-full mx-auto flex items-center justify-center p-4 cursor-zoom-in"
                    >
                      <ResilientImage
                        src={activePreraHeroImg}
                        alt="Pilot Prera Fountain Pen in Empress Teal"
                        fallbackTitle="Pilot Prera in Empress Teal"
                        className="w-full h-full object-contain transition-transform duration-200 hover:scale-[1.03]"
                      />
                    </div>

                    {/* 6 Official Goldspot Studio Angle Thumbnails */}
                    <div className="mt-4 pt-4 border-t border-[#ECE8DF]">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63] mb-2.5">
                        Inspect All 6 Studio Angles (Capped, Posted, Steel Nib, CON-40 &amp; Gift Box)
                      </p>
                      <div className="grid grid-cols-6 gap-2">
                        {empressGallery.map((imgItem, idx) => {
                          const isCurrent = activePreraHeroImg === imgItem.src;
                          return (
                            <button
                              key={imgItem.src}
                              type="button"
                              onClick={() => setActivePreraHeroImg(imgItem.src)}
                              title={imgItem.caption}
                              className={`aspect-square rounded border p-1 bg-white overflow-hidden transition-all cursor-pointer ${
                                isCurrent
                                  ? 'border-[#0A2246] ring-1 ring-[#0A2246]'
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
                              <span className="sr-only">Angle {idx + 1}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Included in the Box Boxout */}
                  <div className="mt-6 p-4 rounded bg-[#F3EFE8] border border-[#E6E1D8]">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#0A2246] mb-2">
                      Included in the Pilot Presentation Box
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#3F3D39]">
                      {pilotPreraProduct.includedItems.map((inc) => (
                        <li key={inc} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#1D5B43] shrink-0" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Column: Product Page Details, Specifications & Contiguous Purchase Module */}
                <div className="lg:col-span-6 p-6 lg:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E6A63] mb-2">
                      <span className="uppercase tracking-wider font-semibold text-[#B58435]">
                        Pilot Japan · Café Demonstrator Series
                      </span>
                      <span aria-hidden="true">·</span>
                      <VariantStockIndicator
                        stockCount={empressVariant.stockCount}
                        availabilityLabel="Same-Day Nairobi Dispatch"
                      />
                    </div>

                    <div className="flex items-baseline justify-between gap-4">
                      <h4 className="font-serif-display text-2xl lg:text-3xl font-semibold text-[#0A2246]">
                        Pilot Prera Fountain Pen in Empress Teal
                      </h4>
                      <span className="font-mono-tabular text-2xl font-bold text-[#0A2246] shrink-0">
                        KES 8,500
                      </span>
                    </div>

                    <div className="mt-4 space-y-3 text-xs sm:text-sm text-[#4A4742] leading-relaxed">
                      <p>
                        The Pilot Prera Fountain Pen in Empress Teal blends subtle
                        sophistication with everyday functionality. The deep, vibrant teal
                        captures a sense of quiet sophistication, while the transparent resin
                        body offers a clear view of the ink level and pre-installed{' '}
                        <strong>Pilot CON-40 converter</strong>.
                      </p>
                      <p>
                        Equipped with a super-smooth Japanese stainless steel nib and Pilot’s
                        renowned cushioned snap-cap, the Prera posts securely to a full
                        5.3-inch (135mm) writing length while remaining compact (121mm) in a
                        pocket or pen case.
                      </p>
                    </div>

                    {/* Nib Selector on Empress Teal Flagship Page */}
                    <div className="mt-5 pt-4 border-t border-[#E6E1D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-wider text-[#0A2246]">
                          Select Nib Size
                        </span>
                        <span className="text-[11px] text-[#6E6A63]">
                          Silver Stainless Steel · Calibrated in Japan
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2">
                        {(['Fine', 'Medium'] as const).map((nib) => {
                          const selected = empressNib === nib;
                          return (
                            <button
                              key={nib}
                              type="button"
                              onClick={() => {
                                handleSelectNib('prera-empress-teal', nib);
                                handleSelectNib('pilot-prera', nib);
                              }}
                              className={`px-4 py-2 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                selected
                                  ? 'border-[#0A2246] bg-[#0A2246] text-white font-semibold'
                                  : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246]'
                              }`}
                            >
                              {nib === 'Fine'
                                ? 'Fine (0.35mm · SKU P22073)'
                                : 'Medium (0.50mm · SKU P22139)'}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Complete Goldspot Technical Specifications Table */}
                    <div className="mt-5 pt-4 border-t border-[#E6E1D8]">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#5C5852] mb-2.5">
                        Pilot Prera in Empress Teal — Technical Specifications
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                        {[
                          { k: 'Pen Material', v: 'Translucent Empress Teal Resin' },
                          { k: 'Trim & Clip', v: 'Polished Silver Rhodium Accent' },
                          { k: 'Nib Material', v: 'Silver Stainless Steel (Fine / Medium)' },
                          { k: 'Cap Type', v: 'Cushioned Snap-Cap (Postable)' },
                          { k: 'Filling Mechanism', v: 'CON-40 Converter + Cartridge Included' },
                          { k: 'Length — Capped', v: '4.8 in. / 121 mm' },
                          { k: 'Length — Uncapped', v: '4.2 in. / 107 mm' },
                          { k: 'Length — Cap Posted', v: '5.3 in. / 135 mm' },
                          { k: 'Cap / Section Ø', v: '13.5 mm Cap · 9.4 mm Grip Section' },
                          { k: 'Total Weight', v: '0.53 oz / 15 g' },
                        ].map((row) => (
                          <div
                            key={row.k}
                            className="flex items-baseline justify-between gap-2 py-1 border-b border-[#ECE8DF]"
                          >
                            <span className="text-[#6E6A63]">{row.k}</span>
                            <span className="font-medium text-[#171614] text-right">
                              {row.v}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Primary Purchase Actions: Add to Bag + Quick Buy + Add to Wishlist */}
                  <div className="mt-6 pt-4 border-t border-[#E6E1D8] flex flex-col gap-2.5">
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectVariant('pilot-prera', empressVariant.id);
                          handleSelectNib('pilot-prera', empressNib);
                          handleAddToCart(
                            pilotPreraProduct,
                            empressVariant,
                            empressNib,
                            true,
                            empressFeedbackKey
                          );
                        }}
                        className={`flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 text-xs font-semibold tracking-wider uppercase rounded transition-colors cursor-pointer whitespace-nowrap ${
                          isEmpressAdded
                            ? 'bg-[#1D5B43] text-white'
                            : 'bg-[#0A2246] hover:bg-[#133468] text-white'
                        }`}
                      >
                        {isEmpressAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Added Empress Teal ({empressNib})</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>
                              Add to Bag ({empressNib} Nib) · KES 8,500
                            </span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleSelectVariant('pilot-prera', empressVariant.id);
                          handleSelectNib('pilot-prera', empressNib);
                          setQuickBuyProduct(pilotPreraProduct);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 py-3 px-4 text-xs font-semibold uppercase tracking-wider rounded border border-[#0A2246] bg-white text-[#0A2246] hover:bg-[#0A2246] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <ShoppingBag className="w-4 h-4 text-[#C88A2E]" />
                        <span>Quick Buy</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleToggleWishlist(
                            pilotPreraProduct,
                            empressVariant,
                            empressNib
                          )
                        }
                        aria-pressed={isEmpressWishlisted}
                        className={`inline-flex items-center justify-center gap-1.5 py-3 px-4 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          isEmpressWishlisted
                            ? 'border-[#C88A2E] bg-[#C88A2E]/12 text-[#0A2246]'
                            : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246]'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isEmpressWishlisted ? 'fill-[#C88A2E] text-[#C88A2E]' : ''
                          }`}
                        />
                        <span>{isEmpressWishlisted ? 'In Wishlist' : 'Wishlist'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* PART B: COMPLETE PILOT PRERA CAFÉ LINEUP — EVERY PEN ONE BY ONE (KES 8,500) */}
        <div className="mb-6 flex items-center justify-between">
          <h4 className="font-serif-display text-xl lg:text-2xl font-semibold text-[#0A2246]">
            Explore All 3 Pilot Prera Café Finishes One by One (KES 8,500 Each)
          </h4>
          <span className="text-xs text-[#6E6A63] hidden sm:inline">
            Empress Teal · Cinnamon Brown · Porcelain White (All Include CON-40 Converter)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pilotPreraProduct.variants.map((variant) => {
            const activeNib: NibOption = selectedNibs[variant.id] || 'Medium';
            const customKey = `prera-grid-${variant.id}-${activeNib}`;
            const isAdded = justAddedKey === customKey;
            const isWishlisted = isItemWishlisted(pilotPreraProduct.id, variant.id);

            return (
              <div
                key={variant.id}
                className="bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div>
                  <div
                    onClick={() =>
                      setZoomModal({
                        src: variant.image || pilotPreraProduct.image,
                        activeView: 'primary',
                        title: `Pilot Prera — ${variant.label} (${activeNib} Nib)`,
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
                      src={variant.image || pilotPreraProduct.image}
                      alt={`Pilot Prera Fountain Pen — ${variant.label} (${activeNib} Nib)`}
                      fallbackTitle={`Pilot Prera ${variant.label}`}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomModal({
                          src: variant.image || pilotPreraProduct.image,
                          activeView: 'primary',
                          title: `Pilot Prera — ${variant.label} (${activeNib} Nib)`,
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
                      <span>Pilot Prera Japan</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#163A5F] font-medium">
                        CON-40 Included
                      </span>
                      <span aria-hidden="true">·</span>
                      <VariantStockIndicator stockCount={variant.stockCount} compact />
                    </div>

                    <div className="flex items-baseline justify-between gap-2 mt-1.5">
                      <h4 className="text-base font-semibold text-[#171614]">
                        Pilot Prera — {variant.label.split(' · ')[0]}
                      </h4>
                      <span className="font-mono-tabular text-sm font-semibold text-[#171614] whitespace-nowrap shrink-0">
                        KES 8,500
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
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectVariant('pilot-prera', variant.id);
                        handleSelectNib('pilot-prera', activeNib);
                        handleAddToCart(
                          pilotPreraProduct,
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

                    <button
                      type="button"
                      onClick={() => {
                        handleSelectVariant('pilot-prera', variant.id);
                        handleSelectNib('pilot-prera', activeNib);
                        setQuickBuyProduct(pilotPreraProduct);
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
                      handleToggleWishlist(pilotPreraProduct, variant, activeNib)
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
