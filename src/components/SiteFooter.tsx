import { BrandLogoLockup } from './primitives';
import { formatKes } from '../lib/storefront';
import { Link } from 'react-router-dom';
import { useStorefront } from '../store/StorefrontContext';

export function SiteFooter() {
  const {
    storeSettings,
    setIsMerchantAdminOpen,
    isAuthorizedAdmin,
  } = useStorefront();
  return (
    <>
      {/* STRUCTURED EDITORIAL FOOTER (NO DUPLICATE LOGO TEXT) */}
      <footer className="bg-[#FAF8F5] border-t border-[#E6E1D8] py-12">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[#E6E1D8] items-start">
            {/* Column 1: Single Official Brand Lockup & Provenance */}
            <div className="md:col-span-5 space-y-2.5">
              <Link
                to="/"
                aria-label="PENS R US — The Pen Specialists"
                className="inline-block"
              >
                <BrandLogoLockup size="footer" />
              </Link>
              <p className="text-xs text-[#5C5852] max-w-sm leading-relaxed">
                Bringing the Art of Writing to Kenya. Authorized Nairobi purveyor of Japanese
                Pilot fountain pens, 24-shade Iroshizuku bottled inks, and Waterman Paris inks.
              </p>
            </div>

            {/* Column 2: Curated Collections */}
            <div className="md:col-span-4 space-y-2 text-xs">
              <p className="font-semibold uppercase tracking-[0.14em] text-[#0A2246]">
                Writing Instruments &amp; Inks
              </p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[#5C5852]">
                <li>
                  <Link to="/collection/madoromi" className="hover:text-[#0A2246] transition-colors">
                    Kakuno Madoromi
                  </Link>
                </li>
                <li>
                  <Link to="/collection/family" className="hover:text-[#0A2246] transition-colors">
                    Kakuno Family
                  </Link>
                </li>
                <li>
                  <Link to="/collection/prera" className="hover:text-[#0A2246] transition-colors">
                    Pilot Prera · Teal
                  </Link>
                </li>
                <li>
                  <Link to="/collection/iroshizuku" className="hover:text-[#0A2246] transition-colors">
                    24 Iroshizuku Inks
                  </Link>
                </li>
                <li>
                  <Link to="/collection/waterman" className="hover:text-[#0A2246] transition-colors">
                    Waterman Paris Inks
                  </Link>
                </li>
                <li>
                  <Link to="/set-builder" className="hover:text-[#0A2246] transition-colors">
                    CON-40 Set Builder
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Kenya Dispatch & Client Care */}
            <div className="md:col-span-3 space-y-2 text-xs text-[#5C5852]">
              <p className="font-semibold uppercase tracking-[0.14em] text-[#0A2246]">
                Nairobi &amp; Kenya Dispatch
              </p>
              <p className="leading-relaxed">
                Same-day courier across Nairobi · Overnight delivery to all 47 counties · M-Pesa
                Express &amp; Cash on Delivery.
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6E6A63]">
            <div className="flex items-center gap-3 flex-wrap">
              <span>© {new Date().getFullYear()} PENS R US Kenya · All Rights Reserved.</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setIsMerchantAdminOpen(true)}
                className="font-semibold text-[#0A2246] hover:text-[#C88A2E] underline underline-offset-4 cursor-pointer"
              >
                {isAuthorizedAdmin
                  ? 'Merchant Admin Console (Edit Catalog & KES Prices)'
                  : 'Staff Portal'}
              </button>
            </div>
            <span className="font-mono-tabular">
              Complimentary Delivery in Nairobi &amp; Nationwide on Orders from{' '}
              {formatKes(storeSettings.freeDeliveryThresholdKes)}
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
