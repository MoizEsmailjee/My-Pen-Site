import { Search, ShoppingBag, X } from 'lucide-react';
import { BrandLogoLockup } from './primitives';
import { formatKes } from '../lib/storefront';
import { resolveAssetUrl } from '../utils/assetResolver';
import { Link, useNavigate } from 'react-router-dom';
import { seriesPath } from '../lib/routes';
import { useStorefront } from '../store/StorefrontContext';

export function SiteHeader() {
  const {
    goToSeries,
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    setZoomModal,
    setIsCartOpen,
    openProduct,
    setQuickBuyProduct,
    normalizedSearch,
    headerSearchResults,
    totalItemsCount,
    handleSelectVariant,
    handleAddInkShadeDirectly,
  } = useStorefront();
  const navigate = useNavigate();
  return (
    <>
      {/* TOP BAR CONTRACT: Strictly 1 row, 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E6E1D8]">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4 lg:gap-8 px-6 py-2">
          {/* Zone 1: Single Official PENS R US Logo Lockup (No Duplicate Text) */}
          <Link
            to="/"
            aria-label="PENS R US — The Pen Specialists Home"
            className="inline-flex items-center whitespace-nowrap shrink-0 group"
          >
            <BrandLogoLockup size="header" />
          </Link>

          {/* Zone 2: Navigation Links + Interactive Search Bar */}
          <div className="flex items-center gap-4 lg:gap-6 flex-1 justify-end md:justify-center max-w-3xl">
            <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-[#524E48] shrink-0">
              <Link
                to="/#collection"
                className="hover:text-[#0A2246] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
              >
                Collection
              </Link>
              <Link
                to="/collection/prera"
                className="hover:text-[#0A2246] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
              >
                Prera Teal
              </Link>
              <Link
                to="/collection/family"
                className="hover:text-[#0A2246] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
              >
                Family Series
              </Link>
              <Link
                to="/collection/iroshizuku"
                className="hover:text-[#0A2246] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
              >
                24 Ink Shades
              </Link>
              <Link
                to="/set-builder"
                className="hover:text-[#0A2246] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
              >
                Set Builder
              </Link>
            </nav>

            {/* Search Bar Next to Navigation Links */}
            <div className="relative w-full max-w-[230px] sm:max-w-[270px] lg:max-w-[290px]">
              <form
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsSearchFocused(false);
                  navigate(
                  headerSearchResults.inkMatches.length > 0 &&
                    headerSearchResults.penMatches.length === 0
                    ? seriesPath('iroshizuku')
                    : seriesPath('all')
                );
                }}
                className="relative flex items-center"
              >
                <Search className="w-3.5 h-3.5 text-[#6E6A63] absolute left-3 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => {
                    // Delay closing slightly so dropdown button clicks register cleanly
                    setTimeout(() => setIsSearchFocused(false), 180);
                  }}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  placeholder="Search pens, ink shades, sheen..."
                  aria-label="Search fountain pens or ink shades by name or characteristics"
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-[#DCD5C7] focus:border-[#0A2246] rounded text-[#171614] placeholder:text-[#8C857B] focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search query"
                    className="absolute right-2 p-0.5 text-[#6E6A63] hover:text-[#171614] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Instant Search Results & Characteristic Discovery Dropdown */}
              {isSearchFocused && (
                <div className="absolute right-0 left-0 sm:left-auto sm:w-[410px] mt-2 bg-[#FAF8F5] border border-[#DCD5C7] rounded-lg shadow-xl z-50 overflow-hidden">
                  {!normalizedSearch ? (
                    <div className="p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B58435] mb-2.5">
                        Search by Name or Characteristic
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'Empress Teal',
                          'Copper Sheen',
                          'Gold Sheen',
                          'Pastel',
                          'Demonstrator',
                          'Ama-iro',
                          'Yama-budo',
                          'Serenity Blue',
                          'Fine Nib',
                          'Converter',
                        ].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSearchQuery(tag);
                            }}
                            className="px-2.5 py-1 text-xs bg-white hover:bg-[#0A2246] text-[#3F3D39] hover:text-white border border-[#DCD5C7] rounded transition-colors cursor-pointer"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : headerSearchResults.totalCount === 0 ? (
                    <div className="p-5 text-center">
                      <p className="text-xs font-semibold text-[#171614]">
                        No pens or ink shades matched "{searchQuery}"
                      </p>
                      <p className="text-[11px] text-[#6E6A63] mt-1">
                        Try searching "Prera", "Kakuno", "Ama-iro", "copper sheen", "pastel",
                        or "teal".
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[420px] overflow-y-auto divide-y divide-[#E6E1D8]">
                      {/* Matched Fountain Pens, Converters & Finishes */}
                      {headerSearchResults.penMatches.length > 0 && (
                        <div className="p-3">
                          <div className="flex items-center justify-between px-1 mb-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63]">
                              Fountain Pens &amp; Instruments ({headerSearchResults.penMatches.length})
                            </span>
                            <Link
                              to="/#collection"
                              onMouseDown={() => goToSeries('all')}
                              className="text-[11px] font-semibold text-[#0A2246] hover:underline"
                            >
                              View in Collection
                            </Link>
                          </div>
                          <div className="space-y-1.5">
                            {headerSearchResults.penMatches.map((match) => (
                              <div
                                key={match.key}
                                className="p-2 rounded bg-white border border-[#E6E1D8] hover:border-[#0A2246] flex items-center justify-between gap-2.5 transition-colors"
                              >
                                <button
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelectVariant(
                                      match.product.id,
                                      match.matchedVariant.id
                                    );
                                    openProduct(match.product);
                                    setIsSearchFocused(false);
                                  }}
                                  className="flex items-center gap-2.5 min-w-0 text-left flex-1 cursor-pointer"
                                >
                                  <img
                                    src={resolveAssetUrl(
                                      match.matchedVariant.image || match.product.image
                                    )}
                                    alt={match.product.name}
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-10 rounded object-contain bg-white border border-[#ECE8DF] shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-[#0A2246] truncate">
                                      {match.product.name}
                                    </p>
                                    <p className="text-[11px] text-[#5C5852] truncate">
                                      {match.matchNote}
                                    </p>
                                  </div>
                                </button>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-mono-tabular text-xs font-semibold text-[#171614]">
                                    {formatKes(match.product.priceKes)}
                                  </span>
                                  <button
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleSelectVariant(
                                        match.product.id,
                                        match.matchedVariant.id
                                      );
                                      setQuickBuyProduct(match.product);
                                      setIsSearchFocused(false);
                                    }}
                                    className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-[#0A2246] text-white rounded hover:bg-[#133468] cursor-pointer"
                                  >
                                    Quick Buy
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matched Iroshizuku Ink Shades by Name or Characteristic */}
                      {headerSearchResults.inkMatches.length > 0 && (
                        <div className="p-3">
                          <div className="flex items-center justify-between px-1 mb-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63]">
                              Iroshizuku Ink Shades ({headerSearchResults.inkMatches.length})
                            </span>
                            <Link
                              to="/collection/iroshizuku"
                              className="text-[11px] font-semibold text-[#0A2246] hover:underline"
                            >
                              Jump to Ink Gallery
                            </Link>
                          </div>
                          <div className="space-y-1.5">
                            {headerSearchResults.inkMatches.map((shade) => (
                              <div
                                key={shade.id}
                                className="p-2 rounded bg-white border border-[#E6E1D8] hover:border-[#0A2246] flex items-center justify-between gap-2.5 transition-colors"
                              >
                                <button
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setZoomModal({
                                      src: shade.image,
                                      secondarySrc: shade.swatchImage,
                                      activeView: 'primary',
                                      title: `Pilot Iroshizuku — ${shade.name} (${shade.kanji})`,
                                      subtitle: `${shade.meaning} · ${shade.sheenNote}`,
                                      swatchHex: shade.hex,
                                      inkShadeId: shade.id,
                                      zoomLevel: 2,
                                      panX: 50,
                                      panY: 50,
                                    });
                                    setIsSearchFocused(false);
                                  }}
                                  className="flex items-center gap-2.5 min-w-0 text-left flex-1 cursor-pointer"
                                >
                                  <span
                                    className="w-6 h-6 rounded-full border border-black/20 shrink-0 shadow-2xs"
                                    style={{ backgroundColor: shade.hex }}
                                  />
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-[#0A2246] truncate">
                                      {shade.name} ({shade.kanji}) ·{' '}
                                      <span className="font-normal text-[#5C5852]">
                                        {shade.meaning}
                                      </span>
                                    </p>
                                    <p className="text-[11px] text-[#6E6A63] truncate">
                                      {shade.sheenNote}
                                    </p>
                                  </div>
                                </button>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-mono-tabular text-xs font-semibold text-[#171614]">
                                    KES 6,000
                                  </span>
                                  <button
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleAddInkShadeDirectly(shade);
                                      setIsSearchFocused(false);
                                    }}
                                    className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-[#0A2246] text-white rounded hover:bg-[#133468] cursor-pointer"
                                  >
                                    + Bag
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-2.5 px-4 py-2 text-xs font-semibold tracking-wider uppercase text-white bg-[#0A2246] hover:bg-[#133468] border border-[#C88A2E]/40 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#E5B25D]" />
              <span className="font-mono-tabular">Bag ({totalItemsCount})</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
