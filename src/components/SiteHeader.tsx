import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import { formatKes } from '../lib/storefront';
import { useStorefront } from '../store/StorefrontContext';
import { HeaderSearch } from './HeaderSearch';
import { BrandLogoLockup } from './primitives';

const NAV = [
  { label: 'Pens', to: ROUTES.range },
  { label: 'Inks', to: ROUTES.inks },
  { label: 'Sets', to: ROUTES.sets },
  { label: 'Delivery', to: ROUTES.delivery },
] as const;

export function SiteHeader() {
  const { setIsCartOpen, totalItemsCount, wishlist, storeSettings } = useStorefront();

  return (
    <>
      <p className="bg-wash px-4 py-1.5 text-center text-xs text-ink-soft sm:text-sm">
        Free delivery on orders from {formatKes(storeSettings.freeDeliveryThresholdKes)} · Same day
        in Nairobi when you order before 3 pm
      </p>
      <header className="sticky top-0 z-30 border-b border-line bg-paper">
        <div className="page flex flex-wrap items-center gap-x-4 gap-y-1 py-2 lg:gap-x-8">
          <Link to={ROUTES.home} aria-label="PENS R US home" className="shrink-0">
            <BrandLogoLockup size="header" />
          </Link>

          <nav
            aria-label="Shop"
            className="order-3 -mx-4 flex basis-full gap-6 overflow-x-auto px-4 pb-1 text-sm font-medium md:order-none md:mx-0 md:basis-auto md:overflow-visible md:px-0 md:pb-0"
          >
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="whitespace-nowrap py-2 underline-offset-8 hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:block lg:w-[280px]">
              <HeaderSearch />
            </div>
            <Link
              to={ROUTES.wishlist}
              aria-label={`Wishlist, ${wishlist.length} saved`}
              className="relative rounded-md p-2.5 hover:bg-wash"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute right-0.5 top-0.5 min-w-4 rounded-full bg-brand px-1 text-center text-[10px] font-semibold leading-4 text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-ink px-3.5 py-2 text-sm font-semibold hover:bg-wash"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="font-mono-tabular">Bag ({totalItemsCount})</span>
            </button>
          </div>

          <div className="order-4 basis-full pb-2 lg:hidden">
            <HeaderSearch />
          </div>
        </div>
      </header>
    </>
  );
}
