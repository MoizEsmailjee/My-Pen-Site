import { Heart, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { seriesPath } from '../lib/routes';
import { useStorefront } from '../store/StorefrontContext';

export function CollectionShell({ children }: { children: React.ReactNode }) {
  const {
    catalogProducts,
    setIsMerchantAdminOpen,
    activeCategory,
    setActiveCategory,
    activeSeriesView,
    searchQuery,
    setSearchQuery,
    wishlist,
    isAuthorizedAdmin,
    normalizedSearch,
    filteredProducts,
    filteredInkVariety,
  } = useStorefront();
  return (
    <>
      <section
        id="collection"
        className="py-16 lg:py-24 bg-[#F3EFE8] border-y border-[#E6E1D8]"
      >
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Section Header + Interactive Segmented Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#6E6A63] mb-2">
                Signature Writing Instruments · Fine &amp; Medium Nibs In Stock
              </p>
              <h2
                className="font-serif-display text-3xl lg:text-4xl font-semibold text-[#171614] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Our Featured Collection
              </h2>
            </div>

            {/* Category filter applies to the overview grid, so it only shows there */}
            {(activeSeriesView === 'all' || isAuthorizedAdmin) && (
            <div
              role="tablist"
              aria-label="Filter collection by category"
              className="flex flex-wrap items-center gap-1 p-1 bg-[#E6E1D8] rounded-md self-start md:self-auto"
            >
              {activeSeriesView === 'all' &&
                (['All', 'Fountain Pens', 'Bottled Inks', 'Converters & Refills'] as const).map(
                (tab) => {
                  const active = activeCategory === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveCategory(tab)}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#FAF8F5] text-[#171614] shadow-xs'
                          : 'text-[#5C5852] hover:text-[#171614]'
                      }`}
                    >
                      {tab === 'All' ? `All Instruments (${catalogProducts.length})` : tab}
                    </button>
                  );
                }
              )}
              {isAuthorizedAdmin && (
                <button
                  type="button"
                  onClick={() => setIsMerchantAdminOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded bg-[#0A2246] text-white hover:bg-[#133468] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Merchant Admin (Edit Prices)
                </button>
              )}
            </div>
            )}
          </div>

          {/* Unified Interactive "Shop by Series" Atelier Switcher Bar */}
          <div className="mb-10 p-3 bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#6E6A63] px-1">
              <span className="font-semibold uppercase tracking-[0.14em] text-[#171614]">
                Atelier View
              </span>
              <span aria-hidden="true">·</span>
              <span>Isolate a specific series or explore the full catalog</span>
            </div>

            <nav
              aria-label="Shop by series"
              className="flex flex-wrap items-center gap-1.5"
            >
              {(
                [
                  { id: 'all', label: 'All Series Overview' },
                  { id: 'prera', label: 'Pilot Prera · Empress Teal (KES 8,500)' },
                  { id: 'madoromi', label: 'Kakuno Madoromi (KES 3,200)' },
                  { id: 'family', label: 'Kakuno Family (KES 2,500)' },
                  { id: 'iroshizuku', label: '24 Iroshizuku Inks (KES 6,000)' },
                  { id: 'waterman', label: 'Waterman Inks (KES 2,000)' },
                ] as const
              ).map((series) => {
                const active = activeSeriesView === series.id;
                return (
                  <Link
                    key={series.id}
                    to={seriesPath(series.id)}
                    aria-current={active ? 'page' : undefined}
                    className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'border-[#0A2246] bg-[#0A2246] text-white'
                        : 'border-[#E6E1D8] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246]'
                    }`}
                  >
                    {series.label}
                  </Link>
                );
              })}

              <Link
                to={seriesPath('wishlist')}
                aria-current={activeSeriesView === 'wishlist' ? 'page' : undefined}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSeriesView === 'wishlist'
                    ? 'border-[#C88A2E] bg-[#0A2246] text-white'
                    : 'border-[#C88A2E]/60 bg-white text-[#0A2246] hover:border-[#C88A2E]'
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    wishlist.length > 0 ? 'fill-[#C88A2E] text-[#C88A2E]' : 'text-[#C88A2E]'
                  }`}
                />
                <span className="font-mono-tabular">Saved Wishlist ({wishlist.length})</span>
              </Link>
            </nav>
          </div>

          {/* Active Header Search Filter Indicator Bar */}
          {normalizedSearch && (
            <div className="mb-8 px-4 py-3 bg-white border border-[#0A2246]/30 rounded-lg flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#171614]">
                <Search className="w-3.5 h-3.5 text-[#0A2246]" />
                <span>
                  Filtering catalog by{' '}
                  <strong className="text-[#0A2246]">"{searchQuery.trim()}"</strong> ·{' '}
                  <span className="font-mono-tabular">
                    {filteredProducts.length} instrument series &amp; {filteredInkVariety.length}{' '}
                    Iroshizuku ink shades matched
                  </span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#0A2246] bg-[#F3EFE8] hover:bg-[#0A2246] hover:text-white rounded border border-[#DCD5C7] transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Clear Search</span>
              </button>
            </div>
          )}

          {children}
        </div>
      </section>
    </>
  );
}
