import { Heart, Plus, Trash2 } from 'lucide-react';
import { ResilientImage } from './primitives';
import { FEATURED_PRODUCTS } from '../data/products';
import { formatKes } from '../lib/storefront';
import { useStorefront } from '../store/StorefrontContext';

export function WishlistView() {
  const {
    goToSeries,
    wishlist,
    setWishlist,
    handleAddToCart,
    handleRemoveWishlistItem,
  } = useStorefront();
  return (
    <>
      <div className="mb-14 bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E1D8]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B58435]">
              Persisted Across Sessions · Local Storage
            </p>
            <h3 className="font-serif-display text-2xl lg:text-3xl font-semibold text-[#0A2246] mt-1">
              Your Saved Writing Instruments &amp; Inks ({wishlist.length})
            </h3>
          </div>
          <div className="flex items-center gap-2.5">
            {wishlist.length > 0 && (
              <button
                type="button"
                onClick={() => setWishlist([])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5C5852] hover:text-red-700 border border-[#DCD5C7] rounded bg-white transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Wishlist</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => goToSeries('all')}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#0A2246] text-white rounded hover:bg-[#133468] transition-colors cursor-pointer"
            >
              Back to All Series
            </button>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="py-12 text-center">
            <Heart className="w-10 h-10 text-[#C88A2E] stroke-[1.25] mx-auto mb-3" />
            <p className="font-serif-display text-xl text-[#0A2246]">
              Your Wishlist is Currently Empty
            </p>
            <p className="text-xs text-[#6E6A63] mt-1 max-w-md mx-auto leading-relaxed">
              Click the “Add to Wishlist” heart button on any Pilot Prera, Kakuno fountain
              pen, CON-40 converter, Iroshizuku ink bottle, or Waterman ink bottle to save
              it here across visits.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {wishlist.map((item) => {
              const matchedProduct = FEATURED_PRODUCTS.find(
                (p) => p.id === item.productId
              );
              const matchedVariant = matchedProduct?.variants.find(
                (v) => v.id === item.variantId
              );

              return (
                <div
                  key={item.id}
                  className="bg-white border border-[#E6E1D8] rounded-lg overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square w-full bg-white p-6 border-b border-[#E6E1D8] flex items-center justify-center">
                      <ResilientImage
                        src={item.image}
                        alt={`${item.productName} — ${item.variantLabel}`}
                        fallbackTitle={item.productName}
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveWishlistItem(item.id)}
                        title="Remove from Wishlist"
                        className="absolute top-3 right-3 p-2 rounded-full bg-[#FAF8F5] border border-[#E6E1D8] text-[#C88A2E] hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Heart className="w-4 h-4 fill-[#C88A2E]" />
                      </button>
                    </div>
                    <div className="p-5">
                      <div className="text-xs text-[#6E6A63]">{item.category}</div>
                      <div className="flex items-baseline justify-between gap-2 mt-1">
                        <h4 className="text-base font-semibold text-[#0A2246]">
                          {item.productName}
                        </h4>
                        <span className="font-mono-tabular text-sm font-semibold text-[#0A2246]">
                          {formatKes(item.priceKes)}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#B58435] mt-1">
                        {item.variantLabel}
                        {item.nibSize ? ` · ${item.nibSize} Nib` : ''}
                      </p>
                      <p className="text-xs text-[#5C5852] mt-1.5 line-clamp-2">
                        {item.sublabel}
                      </p>
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-1 flex items-center gap-2">
                    {matchedProduct && matchedVariant && (
                      <button
                        type="button"
                        onClick={() =>
                          handleAddToCart(
                            matchedProduct,
                            matchedVariant,
                            item.nibSize,
                            true
                          )
                        }
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold tracking-wider uppercase rounded bg-[#0A2246] hover:bg-[#133468] text-white transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Move to Bag</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveWishlistItem(item.id)}
                      className="px-3 py-2.5 text-xs font-medium text-[#5C5852] hover:text-red-700 border border-[#DCD5C7] rounded bg-[#FAF8F5] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
