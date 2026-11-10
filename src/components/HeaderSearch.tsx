import { Search, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES, productPath } from '../lib/routes';
import { formatKes } from '../lib/storefront';
import { useStorefront } from '../store/StorefrontContext';
import { resolveAssetUrl } from '../utils/assetResolver';

/** Header search box with an instant results dropdown for pens and ink shades. */
export function HeaderSearch() {
  const {
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    setZoomModal,
    openProduct,
    setQuickBuyProduct,
    normalizedSearch,
    headerSearchResults,
    handleSelectVariant,
    handleAddInkShadeDirectly,
  } = useStorefront();
  const navigate = useNavigate();
  return (
    <div className="relative w-full max-w-[300px]">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setIsSearchFocused(false);
          navigate(
          headerSearchResults.inkMatches.length > 0 &&
            headerSearchResults.penMatches.length === 0
            ? productPath('pilot-iroshizuku-ink')
            : ROUTES.range
        );
        }}
        className="relative flex items-center"
      >
        <Search className="w-3.5 h-3.5 text-ink-soft absolute left-3 pointer-events-none" />
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
          className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-line focus:border-ink rounded text-ink placeholder:text-faint focus:outline-none transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search query"
            className="absolute right-2 p-0.5 text-ink-soft hover:text-ink cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Instant Search Results & Characteristic Discovery Dropdown */}
      {isSearchFocused && (
        <div className="absolute right-0 left-0 sm:left-auto sm:w-[410px] mt-2 bg-paper border border-line rounded-lg shadow-xl z-50 overflow-hidden">
          {!normalizedSearch ? (
            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand mb-2.5">
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
                    className="px-2.5 py-1 text-xs bg-white hover:bg-ink text-ink-soft hover:text-white border border-line rounded transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : headerSearchResults.totalCount === 0 ? (
            <div className="p-5 text-center">
              <p className="text-xs font-semibold text-ink">
                No pens or ink shades matched "{searchQuery}"
              </p>
              <p className="text-xs text-ink-soft mt-1">
                Try searching "Prera", "Kakuno", "Ama-iro", "copper sheen", "pastel",
                or "teal".
              </p>
            </div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto divide-y divide-line">
              {/* Matched Fountain Pens, Converters & Finishes */}
              {headerSearchResults.penMatches.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center justify-between px-1 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                      Fountain Pens &amp; Instruments ({headerSearchResults.penMatches.length})
                    </span>
                    <Link
                      to={ROUTES.range}
                      onMouseDown={() => navigate(ROUTES.range)}
                      className="text-xs font-semibold text-ink hover:underline"
                    >
                      View in Collection
                    </Link>
                  </div>
                  <div className="space-y-1.5">
                    {headerSearchResults.penMatches.map((match) => (
                      <div
                        key={match.key}
                        className="p-2 rounded bg-white border border-line hover:border-ink flex items-center justify-between gap-2.5 transition-colors"
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
                            loading="lazy"
                            decoding="async"
                            src={resolveAssetUrl(
                              match.matchedVariant.image || match.product.image,
                              'small'
                            )}
                            alt={match.product.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded object-contain bg-white border border-line shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-ink truncate">
                              {match.product.name}
                            </p>
                            <p className="text-xs text-ink-soft truncate">
                              {match.matchNote}
                            </p>
                          </div>
                        </button>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono-tabular text-xs font-semibold text-ink">
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
                            className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-ink text-white rounded hover:bg-ink-hover cursor-pointer"
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
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                      Iroshizuku Ink Shades ({headerSearchResults.inkMatches.length})
                    </span>
                    <Link
                      to={productPath('pilot-iroshizuku-ink')}
                      className="text-xs font-semibold text-ink hover:underline"
                    >
                      Jump to Ink Gallery
                    </Link>
                  </div>
                  <div className="space-y-1.5">
                    {headerSearchResults.inkMatches.map((shade) => (
                      <div
                        key={shade.id}
                        className="p-2 rounded bg-white border border-line hover:border-ink flex items-center justify-between gap-2.5 transition-colors"
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
                            <p className="text-xs font-semibold text-ink truncate">
                              {shade.name} ({shade.kanji}) ·{' '}
                              <span className="font-normal text-ink-soft">
                                {shade.meaning}
                              </span>
                            </p>
                            <p className="text-xs text-ink-soft truncate">
                              {shade.sheenNote}
                            </p>
                          </div>
                        </button>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono-tabular text-xs font-semibold text-ink">
                            KES 6,000
                          </span>
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleAddInkShadeDirectly(shade);
                              setIsSearchFocused(false);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-ink text-white rounded hover:bg-ink-hover cursor-pointer"
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
  );
}
