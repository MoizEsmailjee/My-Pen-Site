import { Link } from 'react-router-dom';
import { ROUTES, productPath } from '../lib/routes';
import { displayName } from '../lib/productDisplay';
import { useStorefront } from '../store/StorefrontContext';

export function SiteFooter() {
  const { catalogProducts, setIsMerchantAdminOpen, isAuthorizedAdmin } = useStorefront();

  return (
    <footer className="border-t border-line py-10 text-sm text-ink-soft">
      <div className="page grid gap-8 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="min-w-0">
          <p className="font-serif-display text-xl text-ink">
            PENS <span className="italic text-brand">R</span> US
          </p>
          <p className="mt-2 max-w-[40ch]">
            The Pen Specialists. Pilot fountain pens, Iroshizuku inks and Waterman inks, delivered
            across Kenya from Nairobi.
          </p>
        </div>
        <nav aria-label="Products" className="grid content-start gap-2">
          <p className="font-semibold text-ink">Shop</p>
          {catalogProducts.map((product) => (
            <Link key={product.id} to={productPath(product.id)} className="hover:text-ink hover:underline">
              {displayName(product)}
            </Link>
          ))}
        </nav>
        <nav aria-label="Help" className="grid content-start gap-2">
          <p className="font-semibold text-ink">Help</p>
          <Link to={ROUTES.delivery} className="hover:text-ink hover:underline">
            Delivery and payment
          </Link>
          <Link to={ROUTES.sets} className="hover:text-ink hover:underline">
            Build a set
          </Link>
          <Link to={ROUTES.wishlist} className="hover:text-ink hover:underline">
            Wishlist
          </Link>
        </nav>
      </div>
      <div className="page mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <span>© {new Date().getFullYear()} PENS R US Kenya</span>
        <button
          type="button"
          onClick={() => setIsMerchantAdminOpen(true)}
          className="underline underline-offset-4 hover:text-ink"
        >
          {isAuthorizedAdmin ? 'Merchant admin' : 'Staff portal'}
        </button>
      </div>
    </footer>
  );
}
